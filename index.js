/**
 * SWITCHER TUNNEL - ULTRA RELAY SERVER v3 (STARK INDUSTRIES STACK)
 * Optimized for Render.com deployment with maximum data transfer speed.
 *
 * Features:
 *  - Multi-Project Hosting (host 3000, 8080, 5000, etc. simultaneously on different ports)
 *  - Raw TCP Protocol Tunneling (SSH, RDP, Guacd, DBs, Games over WSS)
 *  - Apache Guacamole & Vite/Next.js HMR WebSocket compatibility
 *  - Sub-millisecond latency tuning with TCP_NODELAY & flushHeaders()
 *  - High-bandwidth streaming with 512KB buffer high-water marks
 *  - Render keep-alive heartbeat
 */

import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  MSG, nextReqId, reqIdToHex,
  encodeBinaryData, decodeBinaryData,
  compressHeaders, decompressHeaders,
  encodeJson, decodeJson,
  encodePing, encodePong, decodePingPong,
  hrtMs
} from './protocol.js';
import { renderDashboardHtml, renderNotFoundHtml } from './dashboard.js';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = '3.0.0';
const REQUEST_TIMEOUT_MS = 60000;

// Registry of all tunnels: Map<tunnelId, TunnelRouteEntry>
// TunnelRouteEntry: { tunnelId, project, session, mode }
const tunnels = new Map();

// Client sessions: Map<sessionId, SessionEntry>
const sessions = new Map();

// Global telemetry
const stats = {
  totalRequests: 0,
  totalBytes: 0,
  totalTcpConnections: 0,
  startTime: Date.now(),
  avgLatencyMs: 0,
  _latencies: [],
  pushLatency(ms) {
    this._latencies.push(ms);
    if (this._latencies.length > 100) this._latencies.shift();
    this.avgLatencyMs = this._latencies.reduce((a, b) => a + b, 0) / this._latencies.length;
  }
};

// Friendly name generation
const ADJ = ['stark', 'hyper', 'quantum', 'arc', 'warp', 'nano', 'sonic', 'blaze', 'stealth', 'ultra', 'apex', 'cyber'];
const NOUN = ['core', 'reactor', 'flux', 'nexus', 'pulse', 'falcon', 'matrix', 'stream', 'bolt', 'spark', 'titan', 'beacon'];
function genId() {
  return `${ADJ[Math.random() * ADJ.length | 0]}-${NOUN[Math.random() * NOUN.length | 0]}-${(10 + Math.random() * 90) | 0}`;
}

/**
 * Resolves tunnel ID and target path from request
 */
function resolveTunnel(req) {
  const host = req.headers.host || '';
  const url = req.url || '/';

  // 1. Subpath: /t/:tunnelId/(.*)
  const m = url.match(/^\/t\/([a-zA-Z0-9_-]+)(\/.*|\?.*|$)/);
  if (m) {
    const id = m[1].toLowerCase();
    const rawPath = m[2] || '/';
    return { id, path: rawPath.startsWith('/') ? rawPath : '/' + rawPath, mode: 'subpath' };
  }

  // 2. Header: x-tunnel-id
  if (req.headers['x-tunnel-id']) {
    return { id: req.headers['x-tunnel-id'].toLowerCase(), path: url, mode: 'header' };
  }

  // 3. Query: ?_tunnel=:tunnelId
  try {
    const u = new URL(url, `http://${host}`);
    const qt = u.searchParams.get('_tunnel');
    if (qt) {
      u.searchParams.delete('_tunnel');
      return { id: qt.toLowerCase(), path: u.pathname + (u.search || ''), mode: 'query' };
    }
  } catch {}

  // 4. Subdomain: :tunnelId.domain.com
  const parts = host.split('.');
  if (parts.length >= 3) {
    const sub = parts[0].toLowerCase();
    if (sub !== 'www' && sub !== 'switcher' && tunnels.has(sub)) {
      return { id: sub, path: url, mode: 'subdomain' };
    }
  }

  // 5. Referer Fallback (for assets requested with root path e.g. /assets/... from inside a subpath tunnel)
  if (req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      const refMatch = refUrl.pathname.match(/^\/t\/([a-zA-Z0-9_-]+)(?:\/|$)/);
      if (refMatch && tunnels.has(refMatch[1].toLowerCase())) {
        const tid = refMatch[1].toLowerCase();
        if (!url.startsWith('/health') && !url.startsWith('/api/') && !url.startsWith('/switcher-') && url !== '/' && url !== '/index.html') {
          return { id: tid, path: url, mode: 'referer' };
        }
      }
    } catch {}
  }

  // 6. Cookie Fallback (persists active tunnel for root-relative API/asset calls)
  if (req.headers.cookie) {
    const m = req.headers.cookie.match(/switcher_tunnel=([a-zA-Z0-9_-]+)/);
    if (m && tunnels.has(m[1].toLowerCase())) {
      const tid = m[1].toLowerCase();
      if (!url.startsWith('/health') && !url.startsWith('/api/') && !url.startsWith('/switcher-') && url !== '/' && url !== '/index.html') {
        return { id: tid, path: url, mode: 'cookie' };
      }
    }
  }

  return null;
}

// ─── High-Throughput HTTP Server ──────────────────────────────────
const server = http.createServer({
  keepAlive: true,
  keepAliveTimeout: 65000,
  maxHeaderSize: 32768
}, (req, res) => {
  // Disable Nagle's algorithm for instant packet dispatch
  if (req.socket.setNoDelay) req.socket.setNoDelay(true);

  const host = req.headers.host || `localhost:${PORT}`;

  // Health check for Render
  if (req.url === '/healthz' || req.url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    return res.end('STARK_ENGINE_ONLINE');
  }

  // Telemetry API for JARVIS HUD
  if (req.url === '/api/telemetry') {
    res.writeHead(200, {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*'
    });
    return res.end(JSON.stringify({
      tunnelsCount: tunnels.size,
      activeProjects: Array.from(tunnels.keys()),
      totalRequests: stats.totalRequests,
      totalBytes: stats.totalBytes,
      totalTcpConnections: stats.totalTcpConnections,
      uptimeMs: Date.now() - stats.startTime,
      avgLatencyMs: Math.round(stats.avgLatencyMs * 100) / 100,
      version: VERSION
    }));
  }

  // Redirect /t/:tunnelId (without trailing slash) to /t/:tunnelId/
  const noSlashMatch = req.url.match(/^\/t\/([a-zA-Z0-9_-]+)(\?.*)?$/);
  if (noSlashMatch) {
    const tid = noSlashMatch[1].toLowerCase();
    const qs = noSlashMatch[2] || '';
    res.writeHead(301, {
      'location': `/t/${tid}/${qs}`,
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-cache'
    });
    return res.end(`Redirecting to /t/${tid}/${qs}`);
  }

  const resolved = resolveTunnel(req);

  // Landing page if no tunnel targeted
  if (!resolved) {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(renderDashboardHtml({
        activeTunnelsCount: tunnels.size,
        serverHost: host,
        version: VERSION,
        stats
      }));
    }
    if (req.url === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(renderNotFoundHtml({ requestedId: 'unknown', serverHost: host }));
  }

  const { id: tunnelId, path: rewrittenPath, mode } = resolved;
  const route = tunnels.get(tunnelId);

  if (!route || !route.session || route.session.ws.readyState !== WebSocket.OPEN) {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(renderNotFoundHtml({ requestedId: tunnelId, serverHost: host }));
  }

  // ─── Dispatch HTTP Request to Windows Software ───
  const reqId = nextReqId();
  const startTime = hrtMs();
  stats.totalRequests++;

  const pending = {
    req,
    res,
    mode,
    tunnelId,
    startTime,
    headersSent: false,
    timer: setTimeout(() => {
      if (route.session.pendingRequests.has(reqId)) {
        route.session.pendingRequests.delete(reqId);
        if (!res.headersSent) {
          res.writeHead(504, { 'content-type': 'text/plain' });
          res.end('Switcher Tunnel: Gateway Timeout');
        }
      }
    }, REQUEST_TIMEOUT_MS)
  };

  route.session.pendingRequests.set(reqId, pending);

  // Prepare forwarded headers (Special care for Guacamole, auth cookies, and base paths)
  const fwdHeaders = { ...req.headers };
  fwdHeaders['x-forwarded-for'] = req.socket.remoteAddress || '127.0.0.1';
  fwdHeaders['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'http';
  fwdHeaders['x-forwarded-host'] = host;
  fwdHeaders['x-tunnel-id'] = tunnelId;
  fwdHeaders['x-project-id'] = route.project ? route.project.name : tunnelId;

  if (mode === 'subpath') {
    fwdHeaders['x-forwarded-prefix'] = `/t/${tunnelId}`;
  }

  // Send REQ_START control message
  try {
    route.session.ws.send(encodeJson(MSG.REQ_START, {
      id: reqId,
      m: req.method,
      u: rewrittenPath,
      h: compressHeaders(fwdHeaders),
      tp: mode === 'subpath' ? `/t/${tunnelId}` : '',
      proj: route.project ? route.project.name : null
    }));
  } catch (err) {
    clearTimeout(pending.timer);
    route.session.pendingRequests.delete(reqId);
    res.writeHead(502, { 'content-type': 'text/plain' });
    return res.end('Switcher Tunnel: Dispatch failed');
  }

  // Stream request body chunks as pure binary (HOT PATH)
  req.on('data', (chunk) => {
    stats.totalBytes += chunk.length;
    if (route.session.ws.readyState === WebSocket.OPEN) {
      route.session.ws.send(encodeBinaryData(MSG.REQ_DATA, reqId, chunk));
    }
  });

  req.on('end', () => {
    if (route.session.ws.readyState === WebSocket.OPEN) {
      route.session.ws.send(encodeBinaryData(MSG.REQ_END, reqId, Buffer.alloc(0)));
    }
  });

  req.on('error', () => {
    clearTimeout(pending.timer);
    route.session.pendingRequests.delete(reqId);
  });
});

// ─── WebSocket Server: Control, App Proxies (Guacamole), and Raw TCP ───
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  if (socket.setNoDelay) socket.setNoDelay(true);

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // 1. Control Channel (Windows Client Registration)
  if (url.pathname === '/switcher-control') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      handleControlConnection(ws, req, url);
    });
    return;
  }

  // 2. Raw TCP Bridge Endpoint: /switcher-tcp/:tunnelId
  const tcpMatch = url.pathname.match(/^\/switcher-tcp\/([a-zA-Z0-9_-]+)/);
  if (tcpMatch) {
    const targetTunnelId = tcpMatch[1].toLowerCase();
    const route = tunnels.get(targetTunnelId);
    if (route && route.session && route.session.ws.readyState === WebSocket.OPEN) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleRawTcpBridge(ws, route.session, targetTunnelId);
      });
      return;
    }
  }

  // 3. Web App WebSocket Upgrade (Guacamole, Vite HMR, Socket.io)
  const resolved = resolveTunnel(req);
  if (resolved) {
    const route = tunnels.get(resolved.id);
    if (route && route.session && route.session.ws.readyState === WebSocket.OPEN) {
      handleAppWsUpgrade(req, socket, head, route, resolved.path);
      return;
    }
  }

  socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
  socket.destroy();
});

// ─── Control Channel Handler ──────────────────────────────────────
function handleControlConnection(ws, req, url) {
  let session = null;
  const sessionId = Math.random().toString(36).slice(2, 9);

  if (ws._socket?.setNoDelay) ws._socket.setNoDelay(true);
  if (ws._socket?.setKeepAlive) ws._socket.setKeepAlive(true, 15000);

  // Ping client for dashboard
  if (url.searchParams.get('client') === 'web-dashboard') {
    ws.on('message', (data) => ws.send(data));
    return;
  }

  ws.on('message', (message, isBinary) => {
    if (isBinary) {
      const buf = Buffer.isBuffer(message) ? message : Buffer.from(message);
      const msgType = buf[0];

      // Ping / Pong
      if (msgType === MSG.PING && buf.length >= 13) {
        const pp = decodePingPong(buf);
        if (pp) ws.send(encodePong(pp.seqNo, pp.ts1));
        return;
      }

      // RES_DATA (Streaming Response Chunk)
      if (msgType === MSG.RES_DATA && buf.length >= 5 && session) {
        const reqId = buf.readUInt32BE(1);
        const payload = buf.subarray(5);
        const pending = session.pendingRequests.get(reqId);
        if (pending && !pending.res.writableEnded) {
          stats.totalBytes += payload.length;
          pending.res.write(payload);
        }
        return;
      }

      // RES_END
      if (msgType === MSG.RES_END && buf.length >= 5 && session) {
        const reqId = buf.readUInt32BE(1);
        const pending = session.pendingRequests.get(reqId);
        if (pending) {
          clearTimeout(pending.timer);
          stats.pushLatency(hrtMs() - pending.startTime);
          if (!pending.res.writableEnded) pending.res.end();
          session.pendingRequests.delete(reqId);
        }
        return;
      }

      // WS_DATA (WebSocket App Proxying - Guacamole / HMR)
      if (msgType === MSG.WS_DATA && buf.length >= 5 && session) {
        const wsId = buf.readUInt32BE(1);
        const payload = buf.subarray(5);
        const sock = session.wsProxies.get(wsId);
        if (sock && sock.writable) sock.write(payload);
        return;
      }

      // TCP_DATA (Raw TCP Streaming)
      if (msgType === MSG.TCP_DATA && buf.length >= 5 && session) {
        const tcpId = buf.readUInt32BE(1);
        const payload = buf.subarray(5);
        const tcpClientWs = session.tcpBridges.get(tcpId);
        if (tcpClientWs && tcpClientWs.readyState === WebSocket.OPEN) {
          tcpClientWs.send(payload);
        }
        return;
      }

      return;
    }

    // JSON Control Message
    const msg = decodeJson(message);
    if (!msg) return;

    switch (msg.t) {
      // ─── Multi-Project Registration ───
      case MSG.REGISTER: {
        const host = req.headers.host || `localhost:${PORT}`;
        const secure = req.headers['x-forwarded-proto'] === 'https' || req.headers['x-forwarded-ssl'] === 'on';
        const proto = secure ? 'https' : 'http';

        session = {
          sessionId,
          clientId: msg.clientId || null,
          ws,
          clientIp: req.socket.remoteAddress,
          registeredTunnels: new Set(),
          pendingRequests: new Map(),
          wsProxies: new Map(),
          tcpBridges: new Map()
        };
        sessions.set(sessionId, session);

        // Client can send a list of projects: [{ name, port, proto, subdomain }]
        // or a single requestedId for backwards compatibility
        const rawProjects = Array.isArray(msg.projects) ? msg.projects : [{
          name: msg.requestedId || genId(),
          port: msg.localPort || 3000,
          proto: 'http',
          subdomain: msg.requestedId || null
        }];

        const ackProjects = [];

        for (const p of rawProjects) {
          let tid = (p.subdomain || p.name || genId()).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
          if (!tid || tid.length < 2) tid = genId();

          // Static domain retention: If tunnel was previously registered by an old/dropped session,
          // reclaim and rebind it cleanly instead of appending random suffixes (e.g. -34)
          const existingRoute = tunnels.get(tid);
          if (existingRoute && existingRoute.session !== session) {
            const oldSession = existingRoute.session;
            console.log(`[⚡ STARK RELAY] Reclaiming static tunnel '${tid}' from previous session ${oldSession?.sessionId} to session ${sessionId}`);

            if (oldSession) {
              oldSession.registeredTunnels.delete(tid);

              // Evict stale pending requests on the old session for this tunnel
              for (const [reqId, pending] of oldSession.pendingRequests) {
                if (pending.tunnelId === tid) {
                  clearTimeout(pending.timer);
                  if (!pending.res.headersSent) {
                    pending.res.writeHead(502, { 'content-type': 'text/plain' });
                    pending.res.end('Switcher Tunnel: Reconnected with new session');
                  }
                  oldSession.pendingRequests.delete(reqId);
                }
              }

              // If the old session has no other active tunnels, terminate it to prevent ghost sockets
              if (oldSession.registeredTunnels.size === 0) {
                try {
                  oldSession.ws.terminate();
                } catch {}
                sessions.delete(oldSession.sessionId);
              }
            }
          }

          const route = {
            tunnelId: tid,
            project: { ...p, id: tid },
            session,
            proto: p.proto || 'http'
          };

          tunnels.set(tid, route);
          session.registeredTunnels.add(tid);

          const subpathUrl = `${proto}://${host}/t/${tid}/`;
          const subdomainUrl = `${proto}://${tid}.${host.replace(/^www\./, '')}`;

          ackProjects.push({
            name: p.name,
            port: p.port,
            proto: p.proto || 'http',
            tunnelId: tid,
            publicUrl: subpathUrl,
            subpathUrl,
            subdomainUrl
          });
        }

        ws.send(encodeJson(MSG.REGISTER_ACK, {
          sessionId,
          projects: ackProjects,
          primaryTunnelId: ackProjects[0]?.tunnelId,
          publicUrl: ackProjects[0]?.publicUrl,
          serverHost: host,
          version: VERSION
        }));

        console.log(`[⚡ STARK RELAY] Registered ${ackProjects.length} project(s) for client ${session.clientIp}`);
        break;
      }

      // ─── RES_START (Headers) ───
      case MSG.RES_START: {
        if (!session) return;
        const pending = session.pendingRequests.get(msg.id);
        if (pending && !pending.res.headersSent) {
          const headers = decompressHeaders(msg.h || msg.headers || {});
          delete headers['connection'];
          delete headers['transfer-encoding'];
          delete headers['keep-alive'];

          // Subpath URL rewriting
          if (pending.mode === 'subpath') {
            if (headers.location?.startsWith('/')) {
              headers.location = `/t/${pending.tunnelId}${headers.location}`;
            }
            // Cookie path rewrite & active tunnel persistence
            const tunnelCookie = `switcher_tunnel=${pending.tunnelId}; Path=/; SameSite=Lax`;
            if (headers['set-cookie']) {
              if (Array.isArray(headers['set-cookie'])) {
                headers['set-cookie'] = headers['set-cookie'].map(c => c.replace(/Path=\//gi, `Path=/t/${pending.tunnelId}/`)).concat(tunnelCookie);
              } else if (typeof headers['set-cookie'] === 'string') {
                headers['set-cookie'] = [headers['set-cookie'].replace(/Path=\//gi, `Path=/t/${pending.tunnelId}/`), tunnelCookie];
              }
            } else {
              headers['set-cookie'] = [tunnelCookie];
            }
          }

          pending.res.writeHead(msg.s || msg.statusCode || 200, msg.sm || '', headers);
          pending.res.flushHeaders(); // Instant TTFB
          pending.headersSent = true;
        }
        break;
      }

      case MSG.WS_CLOSE: {
        if (!session) return;
        const sock = session.wsProxies.get(msg.id);
        if (sock) {
          sock.end();
          session.wsProxies.delete(msg.id);
        }
        break;
      }

      case MSG.TCP_CLOSE: {
        if (!session) return;
        const bridge = session.tcpBridges.get(msg.id);
        if (bridge) {
          bridge.close();
          session.tcpBridges.delete(msg.id);
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    if (session) {
      console.log(`[⚡ STARK RELAY] Client session ${session.sessionId} disconnected`);
      for (const tid of session.registeredTunnels) {
        tunnels.delete(tid);
      }
      for (const [, p] of session.pendingRequests) {
        clearTimeout(p.timer);
        if (!p.res.headersSent) {
          p.res.writeHead(502, { 'content-type': 'text/plain' });
          p.res.end('Switcher Tunnel: Client disconnected');
        }
      }
      for (const [, s] of session.wsProxies) s.destroy();
      for (const [, b] of session.tcpBridges) b.close();
      sessions.delete(session.sessionId);
    }
  });

  ws.on('error', () => {});
}

// ─── Web App WebSocket Proxy (Guacamole & Vite HMR) ───────────────
function handleAppWsUpgrade(req, socket, head, route, rewrittenPath) {
  const wsId = nextReqId();
  route.session.wsProxies.set(wsId, socket);

  // Preserve Apache Guacamole subprotocol: Sec-WebSocket-Protocol: guacamole
  const protocols = req.headers['sec-websocket-protocol'] || null;

  route.session.ws.send(encodeJson(MSG.WS_OPEN, {
    id: wsId,
    u: rewrittenPath,
    h: compressHeaders(req.headers),
    proto: protocols,
    proj: route.project ? route.project.name : null
  }));

  socket.on('data', (chunk) => {
    if (route.session.ws.readyState === WebSocket.OPEN) {
      route.session.ws.send(encodeBinaryData(MSG.WS_DATA, wsId, chunk));
    }
  });

  socket.on('close', () => {
    if (route.session.ws.readyState === WebSocket.OPEN) {
      route.session.ws.send(encodeJson(MSG.WS_CLOSE, { id: wsId }));
    }
    route.session.wsProxies.delete(wsId);
  });

  socket.on('error', () => route.session.wsProxies.delete(wsId));

  if (head?.length > 0) {
    route.session.ws.send(encodeBinaryData(MSG.WS_DATA, wsId, head));
  }
}

// ─── Raw TCP Bridge over WebSocket ────────────────────────────────
function handleRawTcpBridge(tcpWs, session, tunnelId) {
  const tcpId = nextReqId();
  session.tcpBridges.set(tcpId, tcpWs);
  stats.totalTcpConnections++;

  // Notify client of new TCP stream
  session.ws.send(encodeJson(MSG.TCP_OPEN, {
    id: tcpId,
    tid: tunnelId
  }));

  tcpWs.on('message', (data) => {
    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(encodeBinaryData(MSG.TCP_DATA, tcpId, data));
    }
  });

  tcpWs.on('close', () => {
    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(encodeJson(MSG.TCP_CLOSE, { id: tcpId }));
    }
    session.tcpBridges.delete(tcpId);
  });

  tcpWs.on('error', () => session.tcpBridges.delete(tcpId));
}

// ─── Start Server ────────────────────────────────────────────────
server.listen(PORT, HOST, () => {
  console.log(`
  ╔═════════════════════════════════════════════════════════════════════╗
  ║  ⚡ SWITCHER TUNNEL RELAY v${VERSION} (STARK INDUSTRIES STACK)        ║
  ║  Deploy Target: Render.com Web Service                              ║
  ║  Multi-Project: ENABLED (Host unlimited ports simultaneously)      ║
  ║  Protocols:     HTTP/1.1, WebSockets (Guacamole), Raw TCP           ║
  ║  Status:        ONLINE on http://${HOST}:${PORT}                        ║
  ╚═════════════════════════════════════════════════════════════════════╝
`);
});
