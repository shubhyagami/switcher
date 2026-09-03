/**
 * SWITCHER TUNNEL - JARVIS Server Dashboard v2
 * Arc Reactor themed relay landing page with live holographic HUD
 */

export function renderDashboardHtml({ activeTunnelsCount, serverHost, version = '2.0.0', stats = {} }) {
  const uptime = stats.startTime ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;
  const uptimeStr = `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWITCHER TUNNEL | Relay Server</title>
  <meta name="description" content="Ultra-fast, low-ping tunnel relay server. Zero authentication. Stark Industries grade performance.">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #040810;
      --cyan: #00e5ff;
      --blue: #2979ff;
      --gold: #ffc400;
      --orange: #ff6d00;
      --green: #00e676;
      --text: #e0f7fa;
      --dim: #455a64;
      --panel: rgba(6, 15, 30, 0.8);
      --border: rgba(0, 229, 255, 0.12);
      --glow: rgba(0, 229, 255, 0.3);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Rajdhani', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Animated grid */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        linear-gradient(rgba(0,229,255,0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,229,255,0.015) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      animation: gridPulse 6s ease-in-out infinite;
    }

    @keyframes gridPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

    .scanline {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--cyan), transparent);
      opacity: 0.25;
      z-index: 999;
      animation: scan 5s linear infinite;
      pointer-events: none;
    }
    @keyframes scan { 0% { top: -2px; } 100% { top: 100vh; } }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      position: relative;
      z-index: 5;
    }

    /* Header */
    .hero {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .arc-reactor-hero {
      width: 100px; height: 100px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      background: radial-gradient(circle, var(--cyan) 0%, rgba(0,229,255,0.2) 30%, transparent 65%);
      box-shadow: 0 0 40px var(--glow), 0 0 80px rgba(0,229,255,0.1);
      animation: reactorPulse 2.5s ease-in-out infinite;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .arc-reactor-hero::before {
      content: '';
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(0,229,255,0.3);
      animation: spin 8s linear infinite;
    }

    .arc-reactor-hero::after {
      content: '';
      position: absolute;
      width: 14px; height: 14px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 12px #fff, 0 0 24px var(--cyan);
    }

    @keyframes reactorPulse {
      0%,100% { box-shadow: 0 0 40px var(--glow), 0 0 80px rgba(0,229,255,0.1); }
      50% { box-shadow: 0 0 60px var(--glow), 0 0 120px rgba(0,229,255,0.15); }
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0,229,255,0.06);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 0.35rem 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      color: var(--cyan);
      margin-bottom: 1rem;
    }

    .badge-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
      animation: reactorPulse 1.5s ease-in-out infinite;
    }

    h1 {
      font-family: 'Orbitron', monospace;
      font-size: 2.8rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      background: linear-gradient(135deg, #ffffff 20%, var(--cyan) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
    }

    .tagline {
      font-size: 1.15rem;
      color: var(--dim);
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.5;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      backdrop-filter: blur(12px);
      transition: all 0.3s;
    }
    .stat-card:hover {
      border-color: var(--cyan);
      box-shadow: 0 0 20px rgba(0,229,255,0.1);
      transform: translateY(-2px);
    }

    .stat-val {
      font-family: 'Orbitron', monospace;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--cyan);
      text-shadow: 0 0 10px var(--glow);
      margin-bottom: 0.2rem;
    }

    .stat-label {
      font-family: 'Orbitron', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.15em;
      color: var(--dim);
      text-transform: uppercase;
    }

    /* Main Panels */
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.75rem;
      backdrop-filter: blur(16px);
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    }

    .panel-title {
      font-family: 'Orbitron', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--text);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .cmd-box {
      background: #020408;
      border: 1px solid rgba(0,229,255,0.08);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      color: var(--cyan);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      box-shadow: inset 0 0 15px rgba(0,229,255,0.03);
    }

    .copy-btn {
      background: rgba(0,229,255,0.1);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      font-family: 'Orbitron', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      padding: 0.35rem 0.7rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .copy-btn:hover { background: var(--cyan); color: #000; }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .step {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(0,229,255,0.06);
      border-radius: 10px;
      padding: 1.2rem;
    }

    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cyan), var(--blue));
      color: #000;
      font-family: 'Orbitron', monospace;
      font-weight: 800;
      font-size: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .step h3 {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }

    .step p {
      font-size: 0.88rem;
      color: var(--dim);
      line-height: 1.4;
    }

    .step code {
      background: #020408;
      color: var(--cyan);
      padding: 0.15rem 0.4rem;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
    }

    /* Ping Tester */
    .ping-zone {
      background: #020408;
      border: 1px solid rgba(0,229,255,0.08);
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ping-display {
      font-family: 'Orbitron', monospace;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--cyan);
      text-shadow: 0 0 15px var(--glow);
    }

    footer {
      text-align: center;
      color: var(--dim);
      font-size: 0.85rem;
      padding-top: 1.5rem;
      font-family: 'Orbitron', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.2em;
    }
  </style>
</head>
<body>
  <div class="scanline"></div>
  <div class="container">
    <div class="hero">
      <div class="arc-reactor-hero"></div>
      <div class="badge"><span class="badge-dot"></span>SWITCHER RELAY v${version} | ONLINE</div>
      <h1>SWITCHER TUNNEL</h1>
      <p class="tagline">Ultra-fast, zero-latency reverse proxy tunnel. Binary multiplexed streaming. Zero authentication. Stark Industries grade engineering.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val" id="active-tunnels">${activeTunnelsCount}</div>
        <div class="stat-label">Active Tunnels</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:var(--green);">TCP_NODELAY</div>
        <div class="stat-label">Zero Nagle</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" id="live-ping" style="color:var(--cyan);">-- ms</div>
        <div class="stat-label">Relay RTT</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:var(--gold);">${uptimeStr}</div>
        <div class="stat-label">Uptime</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">⚡ QUICK CONNECT</div>
      <p style="color:var(--dim); margin-bottom:1rem; font-size:0.95rem;">Expose any local port to the world in under 2 seconds:</p>
      <div class="cmd-box">
        <span id="cmd-text">switcher-tunnel 3000 --server https://${serverHost}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('cmd-text').innerText).then(()=>{this.innerText='COPIED';setTimeout(()=>this.innerText='COPY',2000)})">COPY</button>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Run Your App</h3>
          <p>Start your dev server on any port: <code>localhost:3000</code></p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Launch Client</h3>
          <p>Run <code>switcher-tunnel &lt;port&gt;</code> on Windows. Zero signup.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Go Public</h3>
          <p>Get a public URL + JARVIS Inspector at <code>localhost:4040</code></p>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">📶 REAL-TIME RELAY HEALTH</div>
      <div class="ping-zone">
        <div>
          <div style="font-weight:700; margin-bottom:0.25rem;">Live WebSocket RTT</div>
          <div style="color:var(--dim); font-size:0.85rem;">Binary ping measurement from browser → relay → browser</div>
        </div>
        <div class="ping-display" id="ping-text">Measuring...</div>
      </div>
    </div>

    <footer>SWITCHER TUNNEL &bull; ULTRA BINARY PROTOCOL v2 &bull; STARK GRADE ENGINEERING</footer>
  </div>

  <script>
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = proto + '//' + location.host + '/switcher-control?client=web-dashboard';
    function startPing() {
      try {
        const ws = new WebSocket(wsUrl);
        let pingStart = 0;
        ws.binaryType = 'arraybuffer';
        ws.onopen = () => {
          setInterval(() => {
            pingStart = performance.now();
            // Send JSON ping for dashboard
            ws.send(JSON.stringify({ t: 1, ts: Date.now() }));
          }, 2000);
        };
        ws.onmessage = (evt) => {
          const rtt = Math.round(performance.now() - pingStart);
          document.getElementById('ping-text').innerText = rtt + ' ms';
          document.getElementById('live-ping').innerText = rtt + ' ms';
        };
        ws.onclose = () => setTimeout(startPing, 3000);
      } catch { document.getElementById('ping-text').innerText = 'N/A'; }
    }
    startPing();
  </script>
</body>
</html>`;
}

export function renderNotFoundHtml({ requestedId, serverHost }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tunnel Offline | Switcher Tunnel</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      background: #040810;
      color: #e0f7fa;
      font-family: 'Rajdhani', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .box {
      max-width: 520px;
      background: rgba(6, 15, 30, 0.85);
      border: 1px solid rgba(255, 23, 68, 0.2);
      border-radius: 14px;
      padding: 2.5rem;
      text-align: center;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      backdrop-filter: blur(12px);
    }
    h2 { font-family: 'Orbitron', monospace; color: #ff1744; font-size: 1.2rem; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
    p { color: #607d8b; line-height: 1.5; margin-bottom: 1.5rem; }
    code { background: #020408; color: #00e5ff; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }
    .cmd { background: #020408; border: 1px solid rgba(0,229,255,0.08); padding: 0.8rem; border-radius: 8px; font-family: 'JetBrains Mono', monospace; color: #00e676; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="box">
    <h2>TUNNEL OFFLINE</h2>
    <p>Tunnel <code>${requestedId}</code> is not connected to this relay.</p>
    <div class="cmd">switcher-tunnel 3000 --subdomain ${requestedId} --server https://${serverHost}</div>
  </div>
</body>
</html>`;
}
