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
import { resolveIpGeo, getServerGeo, getHostPcGeo, getWebClientGeo, calcDistanceKm, getNextClientColor } from './geoip.js';
import { runTracert } from './traceroute.js';
import { getSatellitesList, getSatellitesStats } from './satellites.js';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = '3.0.0';
const REQUEST_TIMEOUT_MS = 60000;

// Registry of all tunnels: Map<tunnelId, TunnelRouteEntry>
// TunnelRouteEntry: { tunnelId, project, session, mode }
const tunnels = new Map();

// Client sessions: Map<sessionId, SessionEntry>
const sessions = new Map();

// Connected Web Dashboard sockets for live 3D Earth updates
const dashboardSockets = new Set();

/**
 * Constructs the 3-point Triangulation Network Telemetry:
 *  1. SWITCHER-TUNNEL (Host PC running switcher-tunnel.bat)
 *  2. ONRENDER SERVER (Cloud Relay Server hosting the relay)
 *  3. CLIENT WEB LOCATION (Web browser user viewing the dashboard)
 * And the 3-way triangulating network lines connecting them!
 */
async function buildTriangulationTelemetry(host, visitorIp = '', customGeo = null) {
  const renderGeo = await getServerGeo(host);

  // Find primary client session if connected
  let primarySession = null;
  for (const [, s] of sessions) {
    if (s.ws && s.ws.readyState === WebSocket.OPEN) {
      primarySession = s;
      break;
    }
  }

  const hostPcGeo = await getHostPcGeo(primarySession?.clientIp);
  const webClientGeo = await getWebClientGeo(visitorIp, customGeo, hostPcGeo);

  // Collect all projects hosted on this Host PC
  const hostProjects = [];
  for (const [tid, route] of tunnels) {
    hostProjects.push({
      tunnelId: tid,
      projectName: route.project?.name || tid,
      localPort: route.project?.port || 3000,
      proto: route.proto || 'http',
      publicUrl: `http://${host}/t/${tid}/`,
      subpathUrl: `/t/${tid}/`,
      color: route.color || '#00f0ff'
    });
  }

  // Calculate distances between the 3 vertices
  const distPcToRender = calcDistanceKm(hostPcGeo.lat, hostPcGeo.lon, renderGeo.lat, renderGeo.lon);
  const distRenderToWeb = calcDistanceKm(renderGeo.lat, renderGeo.lon, webClientGeo.lat, webClientGeo.lon);
  const distWebToPc = calcDistanceKm(webClientGeo.lat, webClientGeo.lon, hostPcGeo.lat, hostPcGeo.lon);

  // Node 1: Host PC (switcher-tunnel.bat)
  const hostPcNode = {
    id: 'host-pc',
    nodeType: 'host_pc',
    name: 'SWITCHER-TUNNEL // HOST PC',
    script: 'switcher-tunnel.bat',
    ip: hostPcGeo.ip,
    location: hostPcGeo,
    color: '#00e676', // Neon Emerald Green
    status: tunnels.size > 0 ? 'online' : 'waiting',
    projects: hostProjects,
    localPorts: hostProjects.map(p => p.localPort),
    distanceToRenderKm: distPcToRender
  };

  // Node 2: Onrender Server (Cloud Relay Hub)
  const renderServerNode = {
    id: 'render-server',
    nodeType: 'render_server',
    name: 'ONRENDER SERVER // CLOUD RELAY',
    host: host || 'switcher-tunnel.onrender.com',
    port: PORT,
    ip: renderGeo.ip,
    location: renderGeo,
    color: '#ffd600', // Tactical Solar Gold
    status: 'online',
    version: VERSION,
    uptimeMs: Date.now() - stats.startTime,
    distanceToWebKm: distRenderToWeb
  };

  // Node 3: Client Web Location (Browser Visitor)
  const webClientNode = {
    id: 'web-client',
    nodeType: 'web_client',
    name: 'CLIENT WEB // BROWSER VISITOR',
    ip: webClientGeo.ip,
    location: webClientGeo,
    color: '#ff007f', // Cyber Magenta
    status: 'online',
    userAgent: 'Web Dashboard Viewer',
    distanceToPcKm: distWebToPc
  };

  // 3 Triangulating Arcs (Closed Triangulation Circuit)
  // Leg 1: switcher-tunnel -> onrender server (Uplink)
  // Leg 2: onrender server -> client web location (Downlink)
  // Leg 3: client web location -> switcher-tunnel (Triangulation Mesh Loop)
  const arcList = [
    {
      id: 'arc-pc-to-render',
      type: 'uplink',
      fromId: 'host-pc',
      toId: 'render-server',
      from: { lat: hostPcGeo.lat, lon: hostPcGeo.lon, city: hostPcGeo.city, country: hostPcGeo.country, label: 'SWITCHER-TUNNEL (PC)' },
      to: { lat: renderGeo.lat, lon: renderGeo.lon, city: renderGeo.city, country: renderGeo.country, label: 'ONRENDER SERVER' },
      color: '#00e676',
      label: 'UPLINK: SWITCHER-TUNNEL ──► ONRENDER SERVER',
      distanceKm: distPcToRender
    },
    {
      id: 'arc-render-to-web',
      type: 'downlink',
      fromId: 'render-server',
      toId: 'web-client',
      from: { lat: renderGeo.lat, lon: renderGeo.lon, city: renderGeo.city, country: renderGeo.country, label: 'ONRENDER SERVER' },
      to: { lat: webClientGeo.lat, lon: webClientGeo.lon, city: webClientGeo.city, country: webClientGeo.country, label: 'CLIENT WEB' },
      color: '#ffd600',
      label: 'DOWNLINK: ONRENDER SERVER ──► CLIENT WEB',
      distanceKm: distRenderToWeb
    },
    {
      id: 'arc-web-to-pc',
      type: 'triangulate',
      fromId: 'web-client',
      toId: 'host-pc',
      from: { lat: webClientGeo.lat, lon: webClientGeo.lon, city: webClientGeo.city, country: webClientGeo.country, label: 'CLIENT WEB' },
      to: { lat: hostPcGeo.lat, lon: hostPcGeo.lon, city: hostPcGeo.city, country: hostPcGeo.country, label: 'SWITCHER-TUNNEL (PC)' },
      color: '#ff007f',
      label: 'TRIANGULATION MESH: CLIENT WEB ──► SWITCHER-TUNNEL',
      distanceKm: distWebToPc
    }
  ];

  return {
    triangulation: {
      hostPc: hostPcNode,
      renderServer: renderServerNode,
      webClient: webClientNode
    },
    nodes: [hostPcNode, renderServerNode, webClientNode],
    arcs: arcList,
    server: renderServerNode,
    hostPc: hostPcNode,
    webClient: webClientNode,
    projects: hostProjects,
    tunnelsCount: hostProjects.length,
    openPorts: [
      { type: 'relay', port: PORT, label: 'ONRENDER SERVER HUB', proto: 'http/tcp', status: 'listening', host },
      ...hostProjects.map(p => ({
        type: 'client',
        tunnelId: p.tunnelId,
        projectName: p.projectName,
        port: p.localPort,
        proto: p.proto,
        publicUrl: p.publicUrl,
        subpathUrl: p.subpathUrl,
        clientIp: hostPcNode.ip,
        status: 'open_forwarded'
      }))
    ],
    totalRequests: stats.totalRequests,
    totalBytes: stats.totalBytes,
    totalTcpConnections: stats.totalTcpConnections,
    uptimeMs: Date.now() - stats.startTime,
    avgLatencyMs: Math.round(stats.avgLatencyMs * 100) / 100,
    version: VERSION
  };
}

/**
 * Broadcast real-time 3D Earth network graph updates to all active dashboard viewers
 */
async function broadcastDashboardUpdate() {
  if (dashboardSockets.size === 0) return;
  const host = process.env.HOST || (HOST === '0.0.0.0' ? `localhost:${PORT}` : `${HOST}:${PORT}`);
  const telemetry = await buildTriangulationTelemetry(host);

  const payload = JSON.stringify({
    type: 'GRAPH_UPDATE',
    ...telemetry
  });

  for (const clientWs of dashboardSockets) {
    if (clientWs.readyState === WebSocket.OPEN) {
      try { clientWs.send(payload); } catch {}
    }
  }
}

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
}, async (req, res) => {
  // Disable Nagle's algorithm for instant packet dispatch
  if (req.socket.setNoDelay) req.socket.setNoDelay(true);

  const host = req.headers.host || `localhost:${PORT}`;

  // Health check for Render
  if (req.url === '/healthz' || req.url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    return res.end('STARK_ENGINE_ONLINE');
  }

  // Telemetry & Spatial Network Graph API for 3D Globe HUD (Triangulation Network)
  if (req.url?.startsWith('/api/telemetry') || req.url?.startsWith('/api/network-nodes')) {
    const visitorIp = req.headers['cf-connecting-ip'] ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress);

    let customGeo = null;
    try {
      const u = new URL(req.url, `http://${host}`);
      const lat = parseFloat(u.searchParams.get('lat'));
      const lon = parseFloat(u.searchParams.get('lon'));
      const city = u.searchParams.get('city');
      const country = u.searchParams.get('country');
      if (!isNaN(lat) && !isNaN(lon)) {
        customGeo = { lat, lon, city, country };
      }
    } catch {}

    const telemetry = await buildTriangulationTelemetry(host, visitorIp, customGeo);
    res.writeHead(200, {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*'
    });
    return res.end(JSON.stringify(telemetry));
  }

  // Client Web Geolocation Update Endpoint (allows browser to report its detected GPS)
  if (req.url?.startsWith('/api/client-geo')) {
    try {
      const u = new URL(req.url, `http://${host}`);
      const lat = parseFloat(u.searchParams.get('lat'));
      const lon = parseFloat(u.searchParams.get('lon'));
      const city = u.searchParams.get('city') || 'Browser GPS';
      const country = u.searchParams.get('country') || 'Detected Location';
      const visitorIp = req.headers['cf-connecting-ip'] ||
        (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress);

      let customGeo = null;
      if (!isNaN(lat) && !isNaN(lon)) {
        customGeo = { lat, lon, city, country };
      }
      const telemetry = await buildTriangulationTelemetry(host, visitorIp, customGeo);
      broadcastDashboardUpdate();
      res.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*'
      });
      return res.end(JSON.stringify({ success: true, clientGeo: telemetry.webClient }));
    } catch (err) {
      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Live Orbital Satellites Ephemeris API (NORAD / CelesTrak Integration)
  if (req.url?.startsWith('/api/satellites')) {
    try {
      const u = new URL(req.url, `http://${host}`);
      if (u.pathname === '/api/satellites/stats') {
        const stats = await getSatellitesStats();
        res.writeHead(200, {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=300',
          'access-control-allow-origin': '*'
        });
        return res.end(JSON.stringify({ success: true, stats }));
      }

      const group = u.searchParams.get('group') || 'all';
      const search = u.searchParams.get('q') || u.searchParams.get('search') || '';
      const limit = parseInt(u.searchParams.get('limit') || '500', 10);

      const satellites = await getSatellitesList({ group, search, limit });
      res.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=120',
        'access-control-allow-origin': '*'
      });
      return res.end(JSON.stringify({
        success: true,
        timestamp: Date.now(),
        group,
        count: satellites.length,
        satellites
      }));
    } catch (err) {
      res.writeHead(500, {
        'content-type': 'application/json',
        'access-control-allow-origin': '*'
      });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  // Network Traceroute (tracert) Inspection Endpoint
  if (req.url?.startsWith('/api/tracert')) {
    try {
      const u = new URL(req.url, `http://${host}`);
      let target = u.searchParams.get('target') || '8.8.8.8';
      let targetName = target;

      // If target matches a triangulation node or tunnelId
      if (target === 'host-pc' || target === 'switcher-tunnel') {
        const hostPcGeo = await getHostPcGeo();
        target = hostPcGeo.ip || '106.219.132.148';
        targetName = 'SWITCHER-TUNNEL // HOST PC';
      } else if (target === 'render-server') {
        target = '216.24.57.1';
        targetName = 'ONRENDER SERVER // CLOUD RELAY';
      } else if (target === 'web-client') {
        target = '82.165.197.1';
        targetName = 'CLIENT WEB // BROWSER VISITOR';
      } else if (tunnels.has(target.toLowerCase())) {
        const route = tunnels.get(target.toLowerCase());
        target = route.session?.clientIp || '127.0.0.1';
        targetName = route.project?.name || target;
      }

      const traceResult = await runTracert(target);
      res.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*'
      });
      return res.end(JSON.stringify({ ...traceResult, targetName }));
    } catch (err) {
      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Remote Tunnel Close & Host Process Termination Endpoint
  if (req.url?.startsWith('/api/tunnel/close')) {
    try {
      const u = new URL(req.url, `http://${host}`);
      const targetTunnelId = (u.searchParams.get('tunnelId') || '').toLowerCase().trim();
      const killLocalProcess = u.searchParams.get('killApp') !== 'false';
      const terminateClient = u.searchParams.get('terminateClient') === 'true';

      if (!targetTunnelId || !tunnels.has(targetTunnelId)) {
        res.writeHead(404, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
        return res.end(JSON.stringify({ error: `Tunnel '${targetTunnelId}' not found or already closed` }));
      }

      const route = tunnels.get(targetTunnelId);
      const localPort = route.project?.port || 3000;
      const session = route.session;

      console.log(`[🛑 STARK RELAY] Remote close requested for tunnel '${targetTunnelId}' (Port :${localPort}) from web dashboard`);

      // 1. Notify the client on the PC over WebSocket to close the tunnel and terminate the PC app process
      if (session && session.ws && session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(encodeJson(MSG.TUNNEL_CLOSE, {
          tunnelId: targetTunnelId,
          localPort,
          killLocalProcess,
          terminateClient
        }));
      }

      // 2. Clean up route on relay server
      tunnels.delete(targetTunnelId);
      if (session) {
        session.registeredTunnels.delete(targetTunnelId);
        // Evict any pending requests for this tunnel
        for (const [reqId, pending] of session.pendingRequests) {
          if (pending.tunnelId === targetTunnelId) {
            clearTimeout(pending.timer);
            if (!pending.res.headersSent) {
              pending.res.writeHead(502, { 'content-type': 'text/plain' });
              pending.res.end('Switcher Tunnel: Tunnel closed remotely from web');
            }
            session.pendingRequests.delete(reqId);
          }
        }
        // If session has no more tunnels left, or terminateClient is true, close session cleanly
        if (session.registeredTunnels.size === 0 || terminateClient) {
          try { session.ws.close(); } catch {}
          sessions.delete(session.sessionId);
        }
      }

      // 3. Broadcast real-time update to all connected dashboard websockets
      broadcastDashboardUpdate();

      res.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*'
      });
      return res.end(JSON.stringify({
        success: true,
        tunnelId: targetTunnelId,
        localPort,
        message: `Tunnel '${targetTunnelId}' and port :${localPort} closed successfully`
      }));
    } catch (err) {
      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
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
      const serverGeo = await getServerGeo(host);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(renderDashboardHtml({
        activeTunnelsCount: tunnels.size,
        serverHost: host,
        version: VERSION,
        stats,
        serverGeo
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

  // Real-time HUD Dashboard client
  if (url.searchParams.get('client') === 'web-dashboard') {
    dashboardSockets.add(ws);
    ws.on('message', (data) => ws.send(data));
    ws.on('close', () => dashboardSockets.delete(ws));
    ws.on('error', () => dashboardSockets.delete(ws));
    return;
  }

  ws.on('message', async (message, isBinary) => {
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

        const clientIp = req.headers['cf-connecting-ip'] ||
          (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress);
        const color = getNextClientColor();
        const geo = await resolveIpGeo(clientIp, sessionId);

        session = {
          sessionId,
          clientId: msg.clientId || null,
          ws,
          clientIp,
          geo,
          color,
          connectedAt: Date.now(),
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

          const projectColor = getNextClientColor();
          const projectGeo = geo.isLocal ? await resolveIpGeo(clientIp, tid) : geo;

          const route = {
            tunnelId: tid,
            project: { ...p, id: tid },
            session,
            color: projectColor,
            geo: projectGeo,
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
        broadcastDashboardUpdate();
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
            if (headers.location?.startsWith('/') && !headers.location.startsWith(`/t/${pending.tunnelId}/`) && headers.location !== `/t/${pending.tunnelId}`) {
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
      broadcastDashboardUpdate();
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

  const fwdHeaders = { ...req.headers };
  fwdHeaders['x-forwarded-for'] = req.socket.remoteAddress || '127.0.0.1';
  fwdHeaders['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'https';
  fwdHeaders['x-forwarded-host'] = req.headers.host || '';
  fwdHeaders['x-tunnel-id'] = route.project ? route.project.name : '';

  route.session.ws.send(encodeJson(MSG.WS_OPEN, {
    id: wsId,
    u: rewrittenPath,
    h: compressHeaders(fwdHeaders),
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
  // Pre-fetch server geolocation in the background
  getServerGeo(HOST).catch(() => {});

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
