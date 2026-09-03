/**
 * SWITCHER TUNNEL - PROTOCOL v3 (STARK INDUSTRIES STACK)
 * Ultra-fast, zero-overhead multiplexed binary protocol.
 * Supports: HTTP/1.1, HTTP/2 streaming, WebSockets (with Guacamole protocol), and Raw TCP.
 */

// ─── Message Types (Single Byte) ─────────────────────────────────
export const MSG = {
  // Control
  PING:         0x01,
  PONG:         0x02,
  REGISTER:     0x03,
  REGISTER_ACK: 0x04,
  ERROR:        0x05,

  // HTTP Streaming (Hot Path)
  REQ_START:    0x10,
  REQ_DATA:     0x11,
  REQ_END:      0x12,
  RES_START:    0x20,
  RES_DATA:     0x21,
  RES_END:      0x22,

  // WebSocket Streaming (Full support for Vite, Next.js, and Apache Guacamole)
  WS_OPEN:      0x30,
  WS_DATA:      0x31,
  WS_CLOSE:     0x32,

  // Raw TCP Tunneling (SSH, RDP, VNC, Guacd, DBs, Games)
  TCP_OPEN:     0x40,
  TCP_DATA:     0x41,
  TCP_CLOSE:    0x42,

  // Multi-Project Management
  PROJECT_ADD:  0x50,
  PROJECT_DEL:  0x51,
  PROJECT_LIST: 0x52
};

// ─── Fast Monotonic uint32 ID Generator ──────────────────────────
let _reqIdCounter = 1;
export function nextReqId() {
  _reqIdCounter = (_reqIdCounter + 1) & 0x7FFFFFFF;
  return _reqIdCounter;
}

export function reqIdToHex(id) {
  return typeof id === 'number' ? id.toString(16).padStart(8, '0') : String(id);
}

// ─── Binary Data Frame (Zero JSON on Hot Path) ───────────────────
/**
 * Frame structure:
 * [1 byte: MSG_TYPE]
 * [4 bytes: uint32 REQUEST/STREAM_ID]
 * [N bytes: RAW PAYLOAD CHUNK]
 */
export function encodeBinaryData(msgType, reqId, chunk) {
  const isBuf = Buffer.isBuffer(chunk);
  const chunkLen = isBuf ? chunk.length : Buffer.byteLength(chunk);
  const frame = Buffer.allocUnsafe(5 + chunkLen);
  frame[0] = msgType;
  frame.writeUInt32BE(reqId, 1);
  if (isBuf) {
    chunk.copy(frame, 5);
  } else {
    frame.write(chunk, 5);
  }
  return frame;
}

export function decodeBinaryData(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 5) return null;
  return {
    msgType: buf[0],
    reqId: buf.readUInt32BE(1),
    data: buf.subarray(5) // zero-copy subarray
  };
}

// ─── Compact Binary Ping/Pong (13 bytes) ─────────────────────────
export function hrtMs() {
  const [s, ns] = process.hrtime();
  return s * 1000 + ns / 1e6;
}

export function encodePing(seqNo) {
  const buf = Buffer.allocUnsafe(13);
  buf[0] = MSG.PING;
  buf.writeUInt32BE(seqNo, 1);
  buf.writeDoubleBE(hrtMs(), 5);
  return buf;
}

export function encodePong(seqNo, clientTs) {
  const buf = Buffer.allocUnsafe(21);
  buf[0] = MSG.PONG;
  buf.writeUInt32BE(seqNo, 1);
  buf.writeDoubleBE(clientTs, 5);
  buf.writeDoubleBE(hrtMs(), 13);
  return buf;
}

export function decodePingPong(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 13) return null;
  const res = {
    msgType: buf[0],
    seqNo: buf.readUInt32BE(1),
    ts1: buf.readDoubleBE(5)
  };
  if (buf.length >= 21) {
    res.ts2 = buf.readDoubleBE(13);
  }
  return res;
}

// ─── Header Compression Dictionary (HPACK-lite) ───────────────────
const HEADER_DICT = [
  'content-type', 'content-length', 'accept', 'accept-encoding',
  'accept-language', 'user-agent', 'host', 'connection', 'cache-control',
  'cookie', 'set-cookie', 'authorization', 'referer', 'origin',
  'x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host', 'x-forwarded-prefix',
  'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-protocol',
  'sec-websocket-accept', 'upgrade', 'location', 'etag', 'pragma', 'vary',
  'x-tunnel-id', 'x-project-id', 'transfer-encoding'
];

const H2T = new Map();
const T2H = new Map();
HEADER_DICT.forEach((h, i) => {
  H2T.set(h, i);
  T2H.set(i, h);
});

export function compressHeaders(headers = {}) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    const token = H2T.get(key);
    out[token !== undefined ? token : key] = v;
  }
  return out;
}

export function decompressHeaders(compressed = {}) {
  const out = {};
  for (const [k, v] of Object.entries(compressed)) {
    const num = parseInt(k, 10);
    if (!isNaN(num) && T2H.has(num)) {
      out[T2H.get(num)] = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ─── JSON Control Helper ─────────────────────────────────────────
export function encodeJson(type, payload = {}) {
  return JSON.stringify({ t: type, ...payload });
}

export function decodeJson(raw) {
  try {
    return JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf8'));
  } catch {
    return null;
  }
}
