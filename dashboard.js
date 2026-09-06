/**
 * SWITCHER TUNNEL - GOOGLE EARTH 3D COMMAND NET & NETWORK TRACERT ENGINE
 * Accurate photorealistic 3D Earth Globe with NASA Blue Marble Satellite Imagery,
 * Mountain Relief Normal Maps, Ocean Specular Sheen, Drifting Atmospheric Clouds,
 * Native Windows Tracert Network Route Plotting, Top Physical Address Bar with Reverse Geocoding,
 * and Embedded Google Earth 3D Satellite Explorer.
 */

export function renderDashboardHtml({ activeTunnelsCount = 0, serverHost = 'localhost:8080', version = '3.0.0', stats = {}, serverGeo = {} }) {
  const uptime = stats.startTime ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;
  const uptimeStr = `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s`;
  const initialAddress = serverGeo?.address || (serverGeo?.city ? `${serverGeo.city}, ${serverGeo.country}` : 'Resolving physical location...');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWITCHER TUNNEL // GOOGLE EARTH 3D COMMAND NET</title>
  <meta name="description" content="Accurate Google Earth 3D Satellite Map, Native Tracert Network Route Tracer, and Physical Location Inspector for Switcher Tunnel.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Three.js 3D Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <style>
    :root {
      --bg-dark: #01040a;
      --bg-panel: rgba(4, 10, 22, 0.86);
      --bg-panel-border: rgba(0, 240, 255, 0.24);
      --cyan: #00f0ff;
      --cyan-glow: rgba(0, 240, 255, 0.45);
      --gold: #ffb700;
      --gold-glow: rgba(255, 183, 0, 0.45);
      --green: #00e676;
      --magenta: #ff007f;
      --purple: #b388ff;
      --orange: #ff6d00;
      --text-main: #e0f7fa;
      --text-muted: #78909c;
      --text-bright: #ffffff;
      --font-display: 'Orbitron', monospace;
      --font-ui: 'Rajdhani', sans-serif;
      --font-code: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }

    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-ui);
      font-size: 14px;
    }

    /* 3D WebGL Canvas Container */
    #webgl-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      outline: none;
      cursor: grab;
    }
    #webgl-container:active {
      cursor: grabbing;
    }

    /* Sci-Fi Tactical Scanlines & Deep Space Vignette */
    .tactical-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;
      background: radial-gradient(circle at center, transparent 45%, rgba(1, 4, 10, 0.85) 100%);
    }

    .tactical-scanline {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 3;
      background: linear-gradient(rgba(0, 240, 255, 0) 50%, rgba(0, 240, 255, 0.015) 50%),
                  linear-gradient(90deg, rgba(255, 0, 0, 0.008), rgba(0, 255, 0, 0.004), rgba(0, 0, 255, 0.008));
      background-size: 100% 4px, 6px 100%;
      opacity: 0.5;
    }

    /* UI Grid Layout */
    .hud-layer {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.15rem 1.4rem;
    }

    .interactive {
      pointer-events: auto;
    }

    /* Top Command Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-panel);
      backdrop-filter: blur(16px);
      border: 1px solid var(--bg-panel-border);
      border-radius: 10px;
      padding: 0.75rem 1.3rem;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.65), inset 0 0 15px rgba(0, 240, 255, 0.05);
      position: relative;
    }

    .top-bar::before {
      content: '';
      position: absolute;
      top: -1px;
      left: 20px;
      width: 140px;
      height: 2px;
      background: linear-gradient(90deg, var(--cyan), transparent);
      box-shadow: 0 0 10px var(--cyan);
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--cyan) 10%, rgba(0, 240, 255, 0.25) 50%, transparent 70%);
      box-shadow: 0 0 20px var(--cyan-glow);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-logo::after {
      content: '';
      width: 14px;
      height: 14px;
      border: 2px solid var(--cyan);
      border-radius: 50%;
      animation: pulseRings 2.5s infinite linear;
    }

    @keyframes pulseRings {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    .brand-title {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #fff;
      display: flex;
      flex-direction: column;
    }

    .brand-subtitle {
      font-size: 0.6rem;
      font-family: var(--font-code);
      letter-spacing: 0.18em;
      color: var(--cyan);
      text-transform: uppercase;
    }

    /* Top Center Physical Address Button */
    .top-address-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .top-location-btn {
      background: rgba(0, 240, 255, 0.09);
      border: 1px solid var(--cyan);
      border-radius: 99px;
      padding: 0.45rem 1.1rem;
      color: var(--text-bright);
      font-family: var(--font-ui);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.2);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 440px;
    }

    .top-location-btn:hover {
      background: rgba(0, 240, 255, 0.22);
      box-shadow: 0 0 22px var(--cyan-glow);
      transform: translateY(-1px);
    }

    .loc-icon {
      color: var(--gold);
      font-size: 1rem;
      filter: drop-shadow(0 0 6px var(--gold-glow));
    }

    .top-address-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 360px;
      color: #ffffff;
      font-family: var(--font-ui);
      font-size: 0.86rem;
    }

    .loc-arrow {
      font-size: 0.65rem;
      color: var(--cyan);
      margin-left: 2px;
      transition: transform 0.2s;
    }

    /* Expandable Physical Location Card */
    #location-card {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      width: 460px;
      background: rgba(3, 8, 20, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid var(--cyan);
      border-radius: 12px;
      padding: 1.2rem;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 240, 255, 0.3);
      display: none;
      flex-direction: column;
      gap: 0.85rem;
      z-index: 100;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 240, 255, 0.18);
      padding-bottom: 0.5rem;
      font-family: var(--font-display);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--gold);
    }

    .close-card-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 0.1rem 0.4rem;
    }
    .close-card-btn:hover { color: #fff; }

    .address-full {
      font-family: var(--font-code);
      font-size: 0.84rem;
      line-height: 1.45;
      color: #e0f7fa;
      background: rgba(0, 240, 255, 0.05);
      border: 1px solid rgba(0, 240, 255, 0.14);
      border-radius: 6px;
      padding: 0.75rem;
    }

    .card-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }

    .meta-box {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 240, 255, 0.1);
      border-radius: 6px;
      padding: 0.5rem 0.65rem;
      display: flex;
      flex-direction: column;
    }

    .meta-lbl {
      font-family: var(--font-display);
      font-size: 0.54rem;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .meta-val {
      font-family: var(--font-code);
      font-size: 0.78rem;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.3rem;
    }

    .card-btn {
      flex: 1;
      padding: 0.45rem 0.7rem;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.25);
      border-radius: 6px;
      color: var(--cyan);
      font-family: var(--font-display);
      font-size: 0.66rem;
      letter-spacing: 0.08em;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      transition: all 0.15s;
    }

    .card-btn:hover {
      background: var(--cyan);
      color: #000;
      box-shadow: 0 0 14px var(--cyan-glow);
    }

    .btn-gearth {
      background: rgba(255, 183, 0, 0.15);
      border-color: var(--gold);
      color: var(--gold);
    }
    .btn-gearth:hover {
      background: var(--gold);
      color: #000;
      box-shadow: 0 0 14px var(--gold-glow);
    }

    .top-telemetry {
      display: flex;
      align-items: center;
      gap: 1.3rem;
    }

    .tele-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tele-label {
      font-family: var(--font-display);
      font-size: 0.55rem;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .tele-val {
      font-family: var(--font-code);
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--cyan);
      text-shadow: 0 0 8px var(--cyan-glow);
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }

    .hud-btn {
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.25);
      border-radius: 6px;
      color: var(--cyan);
      font-family: var(--font-display);
      font-size: 0.66rem;
      letter-spacing: 0.1em;
      padding: 0.42rem 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .hud-btn:hover {
      background: rgba(0, 240, 255, 0.22);
      border-color: var(--cyan);
      box-shadow: 0 0 14px var(--cyan-glow);
      transform: translateY(-1px);
    }

    .hud-btn.active {
      background: var(--cyan);
      color: #000;
      box-shadow: 0 0 16px var(--cyan-glow);
    }

    /* Main Center Workspace (Floating Panels) */
    .hud-main {
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      margin: 1rem 0;
      flex: 1;
      min-height: 0;
      gap: 1.25rem;
    }

    /* Left & Right Tactical HUD Panels */
    .hud-panel {
      width: 360px;
      background: var(--bg-panel);
      backdrop-filter: blur(18px);
      border: 1px solid var(--bg-panel-border);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 8px 36px rgba(0, 0, 0, 0.75), inset 0 0 20px rgba(0, 240, 255, 0.03);
      position: relative;
    }

    .hud-panel-header {
      padding: 0.85rem 1.15rem;
      background: rgba(0, 240, 255, 0.05);
      border-bottom: 1px solid rgba(0, 240, 255, 0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hud-panel-title {
      font-family: var(--font-display);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .hud-badge {
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--cyan);
      border-radius: 99px;
      padding: 0.15rem 0.6rem;
      font-family: var(--font-code);
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--cyan);
    }

    .hud-panel-body {
      padding: 0.95rem 1.15rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    /* Scrollbars */
    .hud-panel-body::-webkit-scrollbar { width: 5px; }
    .hud-panel-body::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.2); border-radius: 3px; }

    /* Tunnel Link Card */
    .tunnel-card {
      background: rgba(2, 7, 16, 0.75);
      border: 1px solid rgba(0, 240, 255, 0.14);
      border-radius: 8px;
      padding: 0.8rem 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
      border-left: 3px solid var(--cyan);
    }

    .tunnel-card:hover, .tunnel-card.selected {
      border-color: var(--cyan);
      background: rgba(0, 240, 255, 0.09);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.16);
      transform: translateX(2px);
    }

    .tunnel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tunnel-id {
      font-family: var(--font-display);
      font-size: 0.84rem;
      font-weight: 700;
      color: #fff;
    }

    .tunnel-proto {
      font-family: var(--font-code);
      font-size: 0.64rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: rgba(0, 230, 118, 0.15);
      border: 1px solid var(--green);
      color: var(--green);
      text-transform: uppercase;
    }

    .tunnel-route-visual {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-code);
      font-size: 0.74rem;
      color: var(--text-muted);
    }

    .route-arrow {
      color: var(--cyan);
      font-size: 0.82rem;
    }

    .route-dest {
      color: var(--cyan);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tunnel-geo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #90a4ae;
    }

    .tunnel-actions {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.2rem;
    }

    .btn-action {
      flex: 1;
      padding: 0.32rem 0.45rem;
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 4px;
      color: var(--cyan);
      font-family: var(--font-display);
      font-size: 0.62rem;
      letter-spacing: 0.08em;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      transition: all 0.15s;
    }

    .btn-action:hover {
      background: var(--cyan);
      color: #000;
    }

    .btn-tracert-action {
      background: rgba(255, 109, 0, 0.12);
      border-color: var(--orange);
      color: var(--orange);
    }
    .btn-tracert-action:hover {
      background: var(--orange);
      color: #000;
    }

    .btn-close-action {
      background: rgba(255, 23, 68, 0.12);
      border-color: rgba(255, 23, 68, 0.45);
      color: #ff1744;
    }
    .btn-close-action:hover {
      background: #ff1744;
      color: #fff;
      box-shadow: 0 0 14px rgba(255, 23, 68, 0.55);
    }

    /* CLI Quick Box */
    .cli-box {
      background: #010307;
      border: 1px solid rgba(0, 240, 255, 0.15);
      border-radius: 8px;
      padding: 0.75rem;
      margin-top: auto;
    }

    .cli-label {
      font-family: var(--font-display);
      font-size: 0.56rem;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      text-transform: uppercase;
    }

    .cli-cmd {
      font-family: var(--font-code);
      font-size: 0.74rem;
      color: var(--cyan);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.6);
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
    }

    .cli-copy-btn {
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      font-size: 0.56rem;
      font-family: var(--font-display);
      padding: 0.2rem 0.45rem;
      border-radius: 3px;
      cursor: pointer;
    }

    .cli-copy-btn:hover {
      background: var(--cyan);
      color: #000;
    }

    /* Node Inspector (Right Panel) */
    .inspector-metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      background: rgba(0, 240, 255, 0.03);
      border: 1px solid rgba(0, 240, 255, 0.08);
      border-radius: 6px;
      padding: 0.65rem 0.8rem;
    }

    .inspector-title {
      font-family: var(--font-display);
      font-size: 0.58rem;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .inspector-value {
      font-family: var(--font-code);
      font-size: 0.86rem;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    #insp-route {
      font-size: 0.74rem;
      word-break: break-all;
      line-height: 1.35;
      color: var(--cyan);
      background: rgba(0, 0, 0, 0.5);
      padding: 0.35rem 0.55rem;
      border-radius: 4px;
      border: 1px solid rgba(0, 240, 255, 0.12);
      display: block;
      width: 100%;
    }

    /* Tracert Network Path HUD Console Modal */
    #tracert-modal {
      position: absolute;
      bottom: 70px;
      right: 390px;
      width: 480px;
      max-height: 480px;
      background: rgba(2, 6, 16, 0.94);
      backdrop-filter: blur(20px);
      border: 1px solid var(--orange);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 109, 0, 0.25);
      display: none;
      flex-direction: column;
      z-index: 90;
      overflow: hidden;
    }

    .modal-header {
      padding: 0.8rem 1.1rem;
      background: rgba(255, 109, 0, 0.1);
      border-bottom: 1px solid rgba(255, 109, 0, 0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--orange);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .tracert-target-bar {
      padding: 0.6rem 1.1rem;
      background: rgba(0, 0, 0, 0.4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-family: var(--font-code);
      font-size: 0.74rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tracert-hops-table {
      overflow-y: auto;
      max-height: 340px;
      padding: 0.6rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .hop-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 109, 0, 0.15);
      border-radius: 6px;
      padding: 0.45rem 0.75rem;
      font-family: var(--font-code);
      font-size: 0.72rem;
    }

    .hop-idx {
      font-family: var(--font-display);
      font-weight: 800;
      color: var(--orange);
      width: 28px;
    }

    .hop-ip {
      color: #e0f7fa;
      font-weight: 600;
      min-width: 120px;
    }

    .hop-rtt {
      color: var(--green);
      font-weight: 700;
      min-width: 60px;
      text-align: right;
    }

    .hop-geo {
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 140px;
      text-align: right;
    }

    /* Active Open Ports Matrix Modal & Tags */
    .port-open-badge {
      font-family: var(--font-code);
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--green);
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid var(--green);
      border-radius: 4px;
      padding: 0.12rem 0.45rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      box-shadow: 0 0 8px rgba(0, 230, 118, 0.2);
    }

    .port-chip-tag {
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid var(--green);
      color: var(--green);
      font-family: var(--font-code);
      font-size: 0.62rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .port-chip-tag:hover {
      background: var(--green);
      color: #000;
      box-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
    }

    .port-forward-matrix {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(0, 240, 255, 0.1);
      border-radius: 6px;
      padding: 0.45rem 0.65rem;
    }

    .port-box {
      display: flex;
      flex-direction: column;
    }
    .port-box .p-tag {
      font-family: var(--font-display);
      font-size: 0.52rem;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }
    .port-box .p-val {
      font-family: var(--font-code);
      font-size: 0.76rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    .port-box.local .p-val {
      color: var(--green);
    }
    .p-arrow {
      color: var(--cyan);
      font-size: 0.75rem;
    }

    .port-listener-tag {
      color: var(--green);
      font-family: var(--font-code);
      font-size: 0.68rem;
      font-weight: 600;
    }

    #ports-modal {
      position: absolute;
      top: 75px;
      left: 380px;
      width: 520px;
      max-height: 520px;
      background: rgba(2, 6, 16, 0.96);
      backdrop-filter: blur(22px);
      border: 1px solid var(--green);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 230, 118, 0.25);
      display: none;
      flex-direction: column;
      z-index: 95;
      overflow: hidden;
    }

    .port-modal-row {
      background: rgba(0, 230, 118, 0.04);
      border: 1px solid rgba(0, 230, 118, 0.16);
      border-radius: 8px;
      padding: 0.75rem 0.95rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.15s;
    }
    .port-modal-row:hover {
      background: rgba(0, 230, 118, 0.1);
      border-color: var(--green);
    }

    /* Triangulation Command Network Styles */
    .triangulation-flow-bar {
      padding: 0.45rem 0.85rem;
      background: rgba(0, 0, 0, 0.55);
      border-bottom: 1px solid rgba(0, 240, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-code);
      font-size: 0.63rem;
      color: var(--cyan);
    }
    .tri-leg {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .tri-arrow {
      color: var(--gold);
      font-weight: 700;
    }
    .host-ports-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin: 0.45rem 0;
    }
    .host-port-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(0, 230, 118, 0.2);
      border-radius: 5px;
      padding: 0.35rem 0.55rem;
    }
    .host-port-info {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-family: var(--font-code);
      font-size: 0.72rem;
      overflow: hidden;
    }
    .host-port-val {
      color: var(--green);
      font-weight: 700;
    }
    .host-port-url {
      color: var(--cyan);
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 95px;
    }
    .host-port-actions {
      display: flex;
      gap: 0.25rem;
    }
    .tri-dist-tag {
      font-family: var(--font-code);
      font-size: 0.62rem;
      padding: 0.12rem 0.4rem;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
    }

    /* Embedded Google Earth 3D Satellite Viewer Modal */
    #gearth-modal {
      position: absolute;
      inset: 65px 25px 65px 25px;
      background: rgba(2, 6, 16, 0.96);
      backdrop-filter: blur(24px);
      border: 2px solid var(--gold);
      border-radius: 14px;
      box-shadow: 0 16px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 183, 0, 0.3);
      display: none;
      flex-direction: column;
      z-index: 150;
      overflow: hidden;
    }

    .gearth-header {
      padding: 0.9rem 1.4rem;
      background: rgba(255, 183, 0, 0.1);
      border-bottom: 1px solid rgba(255, 183, 0, 0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .gearth-title {
      font-family: var(--font-display);
      font-size: 0.86rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .gearth-frame-container {
      flex: 1;
      position: relative;
      background: #000;
    }

    .gearth-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Bottom Event Terminal & Camera Bar */
    .hud-bottom {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .camera-controls-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      pointer-events: auto;
      flex-wrap: wrap;
    }

    .cam-btn {
      background: var(--bg-panel);
      backdrop-filter: blur(14px);
      border: 1px solid var(--bg-panel-border);
      border-radius: 8px;
      color: var(--text-main);
      font-family: var(--font-display);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      padding: 0.48rem 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      transition: all 0.2s;
    }

    .cam-btn:hover {
      border-color: var(--cyan);
      color: var(--cyan);
      box-shadow: 0 0 16px var(--cyan-glow);
      transform: translateY(-2px);
    }

    .cam-btn.active {
      border-color: var(--cyan);
      background: rgba(0, 240, 255, 0.22);
      color: var(--cyan);
      box-shadow: 0 0 16px var(--cyan-glow);
    }

    .cam-btn-gold {
      border-color: rgba(255, 183, 0, 0.4);
      color: var(--gold);
    }
    .cam-btn-gold:hover {
      border-color: var(--gold);
      box-shadow: 0 0 16px var(--gold-glow);
    }

    .cam-btn-orange {
      border-color: rgba(255, 109, 0, 0.4);
      color: var(--orange);
    }
    .cam-btn-orange:hover {
      border-color: var(--orange);
      box-shadow: 0 0 16px rgba(255, 109, 0, 0.45);
    }

    /* Scrolling Event Ticker */
    .event-ticker {
      background: var(--bg-panel);
      backdrop-filter: blur(14px);
      border: 1px solid var(--bg-panel-border);
      border-radius: 8px;
      padding: 0.45rem 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-family: var(--font-code);
      font-size: 0.72rem;
      overflow: hidden;
      white-space: nowrap;
    }

    .ticker-label {
      font-family: var(--font-display);
      font-size: 0.6rem;
      font-weight: 800;
      color: var(--cyan);
      letter-spacing: 0.15em;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .ticker-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
      animation: pulseRings 1.5s infinite;
    }

    .ticker-content {
      color: #b0bec5;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 3D Target Tooltip */
    #node-tooltip {
      position: absolute;
      z-index: 50;
      background: rgba(3, 9, 22, 0.94);
      backdrop-filter: blur(14px);
      border: 1px solid var(--cyan);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      pointer-events: none;
      display: none;
      box-shadow: 0 0 24px rgba(0, 240, 255, 0.35);
      font-family: var(--font-ui);
      transform: translate(-50%, -120%);
    }

    #node-tooltip .tt-title {
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--cyan);
      margin-bottom: 0.2rem;
    }

    #node-tooltip .tt-detail {
      font-family: var(--font-code);
      font-size: 0.72rem;
      color: #cfd8dc;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .top-address-container { max-width: 260px; }
      .top-location-btn { max-width: 260px; }
      .top-address-text { max-width: 190px; }
    }
    @media (max-width: 1024px) {
      .hud-panel { width: 280px; }
      .tele-stat:nth-child(n+3) { display: none; }
      #tracert-modal { right: 20px; width: 340px; }
    }
    @media (max-width: 768px) {
      .hud-main { flex-direction: column; }
      .hud-panel { width: 100%; height: 200px; }
      .top-bar { flex-wrap: wrap; gap: 0.5rem; }
    }
  </style>
</head>
<body>
  <!-- 3D WebGL Canvas -->
  <div id="webgl-container"></div>
  <div class="tactical-overlay"></div>
  <div class="tactical-scanline"></div>

  <!-- Floating Holographic Tooltip -->
  <div id="node-tooltip">
    <div class="tt-title" id="tt-title">MAIN SYSTEM</div>
    <div class="tt-detail" id="tt-port" style="color:var(--green); font-weight:700;">● PORT :8080 (CORE HUB)</div>
    <div class="tt-detail" id="tt-ip">IP: 127.0.0.1</div>
    <div class="tt-detail" id="tt-location">Kolkata, India</div>
    <div class="tt-detail" id="tt-route">Port Forward: /t/demo/</div>
  </div>

  <!-- Tactical HUD Layer -->
  <div class="hud-layer">
    <!-- Top Command Bar -->
    <header class="top-bar interactive">
      <div class="brand-section">
        <div class="brand-logo"></div>
        <div class="brand-title">
          <span>SWITCHER TUNNEL</span>
          <span class="brand-subtitle">GOOGLE EARTH 3D COMMAND // v${version}</span>
        </div>
      </div>

      <!-- Prominent Top Address / Location Button -->
      <div class="top-address-container">
        <button class="top-location-btn" id="top-loc-btn" onclick="toggleLocationCard()">
          <span class="loc-icon">📍</span>
          <span class="top-address-text" id="top-address-text">${initialAddress}</span>
          <span class="loc-arrow" id="top-loc-arrow">▼</span>
        </button>

        <!-- Expandable Holographic Physical Location Card -->
        <div id="location-card" class="interactive">
          <div class="card-header">
            <span>📍 PHYSICAL STREET LOCATION & COORDS</span>
            <button class="close-card-btn" onclick="toggleLocationCard()">✕</button>
          </div>
          <div class="card-body">
            <div class="address-full" id="card-full-address">${initialAddress}</div>
            <div class="card-meta-grid" style="margin-top:0.6rem;">
              <div class="meta-box">
                <span class="meta-lbl">COORDINATES</span>
                <span class="meta-val" id="card-coords">${serverGeo?.lat ? serverGeo.lat.toFixed(4) + '°, ' + serverGeo.lon.toFixed(4) + '°' : '22.5696°, 88.3696°'}</span>
              </div>
              <div class="meta-box">
                <span class="meta-lbl">NETWORK / ISP</span>
                <span class="meta-val" id="card-isp">${serverGeo?.isp || 'Switcher Relay Mesh'}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="card-btn" onclick="copyAddress()"><span id="copy-addr-text">📋 COPY ADDRESS</span></button>
              <a id="card-gearth-link" href="https://earth.google.com/web/@${serverGeo?.lat || 22.5696},${serverGeo?.lon || 88.3696},500a,35y,0h,45t,0r" target="_blank" class="card-btn btn-gearth">🌍 GOOGLE EARTH 3D ↗</a>
              <button class="card-btn" onclick="openEmbeddedGoogleEarth()">🛰️ 3D TILES VIEW</button>
            </div>
          </div>
        </div>
      </div>

      <div class="top-telemetry">
        <div class="tele-stat" style="cursor:pointer;" onclick="openPortsModal()" title="Click to inspect all active open ports & routes">
          <span class="tele-label" style="color:var(--green);">⚡ OPEN PORTS</span>
          <span class="tele-val" id="hud-open-ports" style="color:var(--green); font-size:0.84rem;">SCANNING...</span>
        </div>
        <div class="tele-stat">
          <span class="tele-label">Active Tunnels</span>
          <span class="tele-val" id="hud-tunnel-count">${activeTunnelsCount}</span>
        </div>
        <div class="tele-stat">
          <span class="tele-label">Relay RTT</span>
          <span class="tele-val" id="hud-ping">-- ms</span>
        </div>
        <div class="tele-stat">
          <span class="tele-label">Kernel TCP</span>
          <span class="tele-val" style="color:var(--green);">NODELAY</span>
        </div>
        <div class="tele-stat">
          <span class="tele-label">Uptime</span>
          <span class="tele-val" style="color:var(--gold);">${uptimeStr}</span>
        </div>
        <div class="tele-stat">
          <span class="tele-label">ZULU CLOCK</span>
          <span class="tele-val" id="zulu-clock" style="color:#ffffff;">00:00:00Z</span>
        </div>
      </div>

      <div class="top-actions">
        <button class="hud-btn" id="sfx-toggle" onclick="toggleAudio()">
          <span id="sfx-icon">🔈</span> SFX: OFF
        </button>
        <button class="hud-btn" onclick="toggleFullscreen()">
          <span>⛶</span> FULLSCREEN
        </button>
      </div>
    </header>

    <!-- Main Floating Panels -->
    <div class="hud-main">
      <!-- Left Panel: Forwarding Links & Tunnels -->
      <aside class="hud-panel interactive">
        <div class="hud-panel-header">
          <div class="hud-panel-title">
            <span>🔺 TRIANGULATION NETWORK</span>
          </div>
          <span class="hud-badge" id="panel-tunnel-count" style="border-color:var(--green); color:var(--green);">3 NODES</span>
        </div>
        <!-- Triangulation Circuit Flow Bar -->
        <div class="triangulation-flow-bar">
          <span class="tri-leg" style="color:var(--green);">💻 PC</span>
          <span class="tri-arrow">──►</span>
          <span class="tri-leg" style="color:var(--gold);">☁️ RENDER</span>
          <span class="tri-arrow">──►</span>
          <span class="tri-leg" style="color:var(--magenta);">📱 WEB</span>
          <button onclick="focusTriangulationView()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#fff; font-family:var(--font-code); font-size:0.55rem; padding:0.1rem 0.35rem; border-radius:3px; cursor:pointer;">FOCUS 🔺</button>
        </div>
        <!-- Quick Open Ports Strip -->
        <div id="ports-quick-bar" style="padding:0.42rem 1rem; background:rgba(0,230,118,0.06); border-bottom:1px solid rgba(0,230,118,0.18); display:flex; align-items:center; justify-content:space-between; gap:0.45rem;">
          <span style="font-family:var(--font-display); font-size:0.56rem; color:var(--green); font-weight:700; letter-spacing:0.08em;">OPEN PORTS:</span>
          <div id="ports-chips-list" style="display:flex; gap:0.35rem; flex-wrap:wrap;"></div>
          <button onclick="openPortsModal()" style="background:transparent; border:none; color:var(--green); font-family:var(--font-display); font-size:0.56rem; cursor:pointer; text-decoration:underline;">MATRIX ↗</button>
        </div>
        <div class="hud-panel-body" id="tunnels-list">
          <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted);">
            Scanning network nodes...
          </div>
        </div>
        <div class="cli-box">
          <div class="cli-label">QUICK FORWARD COMMAND</div>
          <div class="cli-cmd">
            <span id="cli-cmd-text">switcher-tunnel 3000 --server https://${serverHost}</span>
            <button class="cli-copy-btn" onclick="copyCliCmd()">COPY</button>
          </div>
        </div>
      </aside>

      <!-- Right Panel: Node Target Inspector -->
      <aside class="hud-panel interactive">
        <div class="hud-panel-header">
          <div class="hud-panel-title">
            <span>🎯 TARGET NODE INSPECTOR</span>
          </div>
          <span class="hud-badge" id="inspector-badge" style="border-color:var(--gold); color:var(--gold);">HUB ACTIVE</span>
        </div>
        <div class="hud-panel-body" id="inspector-body">
          <div class="inspector-metric">
            <span class="inspector-title">Target Node Identity</span>
            <span class="inspector-value" id="insp-name" style="color:var(--gold);">MAIN SYSTEM // RELAY CORE</span>
          </div>
          <div class="inspector-metric" style="border-color:rgba(0,230,118,0.25); background:rgba(0,230,118,0.05);">
            <span class="inspector-title" style="color:var(--green);">⚡ Port Status & Binding</span>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
              <span class="inspector-value" id="insp-port-badge" style="color:var(--green); font-size:0.86rem; font-weight:700;">● PORT :8080 (CORE RELAY HUB)</span>
              <span id="insp-port-state" style="font-family:var(--font-code); font-size:0.65rem; background:rgba(0,230,118,0.15); border:1px solid var(--green); padding:0.1rem 0.4rem; border-radius:3px; color:var(--green); font-weight:700;">OPEN</span>
            </div>
          </div>
          <div class="inspector-metric">
            <span class="inspector-title">Network IP Address</span>
            <span class="inspector-value" id="insp-ip">Resolving...</span>
          </div>
          <div class="inspector-metric">
            <span class="inspector-title">Physical Geolocation</span>
            <span class="inspector-value" id="insp-geo">--</span>
          </div>
          <div class="inspector-metric">
            <span class="inspector-title">Coordinates & Distance</span>
            <span class="inspector-value" id="insp-coords">--</span>
          </div>
          <div class="inspector-metric">
            <span class="inspector-title">Forwarding Endpoint & Open Port</span>
            <span class="inspector-value" id="insp-route">https://${serverHost}</span>
          </div>
          <div class="inspector-metric">
            <span class="inspector-title">Network ISP / Provider</span>
            <span class="inspector-value" id="insp-isp">Switcher Core Mesh</span>
          </div>
          <div style="display:flex; gap:0.45rem; margin-top:0.35rem;">
            <button class="btn-action btn-tracert-action" onclick="runNodeTracert()" style="padding:0.45rem;">⚡ RUN TRACERT (TRACE HOPS)</button>
            <button class="btn-action" onclick="openEmbeddedGoogleEarth()" style="padding:0.45rem; border-color:var(--gold); color:var(--gold);">🌍 GOOGLE EARTH</button>
          </div>
          <button id="insp-close-btn" class="btn-action btn-close-action" onclick="closeCurrentInspectedNode()" style="display:none; margin-top:0.45rem; padding:0.48rem; width:100%;">🛑 CLOSE TUNNEL & TERMINATE APP</button>
        </div>
      </aside>
    </div>

    <!-- Active Open Ports Matrix HUD Console Modal -->
    <div id="ports-modal" class="interactive">
      <div class="modal-header" style="background:rgba(0,230,118,0.12); border-bottom:1px solid rgba(0,230,118,0.25);">
        <div class="modal-title" style="color:var(--green);">
          <span class="ticker-dot" style="background:var(--green); box-shadow:0 0 8px var(--green);"></span>
          <span>⚡ ACTIVE OPEN PORTS MATRIX & TUNNEL STATUS</span>
        </div>
        <button class="close-card-btn" onclick="closePortsModal()">✕</button>
      </div>
      <div style="padding:0.7rem 1.15rem; background:rgba(0,0,0,0.5); border-bottom:1px solid rgba(255,255,255,0.06); font-family:var(--font-code); font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
        <div>TOTAL OPEN PORTS: <strong id="ports-modal-count" style="color:var(--green);">3 ACTIVE</strong></div>
        <div style="color:var(--text-muted); font-size:0.68rem;">Direct TCP / HTTP / WebSocket Proxying</div>
      </div>
      <div id="ports-modal-table-body" style="padding:0.85rem 1.15rem; overflow-y:auto; max-height:360px; display:flex; flex-direction:column; gap:0.65rem;">
        <!-- Dynamically rendered open port rows -->
      </div>
    </div>

    <!-- Tracert Network Route Path Modal Console -->
    <div id="tracert-modal" class="interactive">
      <div class="modal-header">
        <div class="modal-title">
          <span class="ticker-dot" style="background:var(--orange); box-shadow:0 0 8px var(--orange);"></span>
          <span>⚡ NETWORK TRACERT ROUTE PATH</span>
        </div>
        <button class="close-card-btn" onclick="closeTracertModal()">✕</button>
      </div>
      <div class="tracert-target-bar">
        <div><span>TARGET:</span> <strong id="tracert-target-name" style="color:var(--orange);">8.8.8.8</strong></div>
        <button class="hud-btn" onclick="runNodeTracert()" style="padding:0.25rem 0.6rem; font-size:0.6rem;">🔄 RE-TRACE</button>
      </div>
      <div class="tracert-hops-table" id="tracert-hops-list">
        <div style="text-align:center; padding:1.5rem; color:var(--text-muted);">
          Executing Windows tracert -d to trace router hops across backbones...
        </div>
      </div>
    </div>

    <!-- Embedded Google Earth 3D Satellite Viewer Modal -->
    <div id="gearth-modal" class="interactive">
      <div class="gearth-header">
        <div class="gearth-title">
          <span>🌍 GOOGLE EARTH 3D SATELLITE EXPLORER</span>
          <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-code);" id="gearth-coords-label">22.5696° N, 88.3696° E</span>
        </div>
        <div style="display:flex; gap:0.6rem; align-items:center;">
          <a id="gearth-fullscreen-link" href="#" target="_blank" class="hud-btn" style="border-color:var(--gold); color:var(--gold);">LAUNCH GOOGLE EARTH WEB ↗</a>
          <button class="close-card-btn" onclick="closeEmbeddedGoogleEarth()" style="font-size:1.2rem;">✕</button>
        </div>
      </div>
      <div class="gearth-frame-container">
        <iframe id="gearth-iframe" class="gearth-iframe" src="" allowfullscreen loading="lazy"></iframe>
      </div>
    </div>

    <!-- Bottom Controls & Event Ticker -->
    <div class="hud-bottom">
      <!-- Camera & Map Style Controls Bar -->
      <div class="camera-controls-bar interactive">
        <button class="cam-btn active" id="btn-style-sat" onclick="setMapStyle('satellite')">
          <span>🛰️</span> SATELLITE HD
        </button>
        <button class="cam-btn" id="btn-style-night" onclick="setMapStyle('night')">
          <span>🌃</span> NIGHT LIGHTS
        </button>
        <button class="cam-btn" id="btn-style-dark" onclick="setMapStyle('dark')">
          <span>🌐</span> TACTICAL TOPOGRAPHY
        </button>
        <button class="cam-btn active" id="btn-clouds" onclick="toggleClouds()">
          <span>☁️</span> CLOUDS: ON
        </button>
        <button class="cam-btn" id="btn-open-ports" onclick="openPortsModal()" style="border-color:rgba(0,230,118,0.4); color:var(--green);">
          <span>🔌</span> OPEN PORTS MATRIX
        </button>
        <button class="cam-btn cam-btn-orange" onclick="runNodeTracert()">
          <span>⚡</span> TRACERT PATH
        </button>
        <button class="cam-btn cam-btn-gold" onclick="openEmbeddedGoogleEarth()">
          <span>🌍</span> GOOGLE EARTH 3D
        </button>
        <button class="cam-btn" onclick="focusMainSystem()">
          <span>📍</span> FOCUS SERVER
        </button>
        <button class="cam-btn" onclick="cycleClientNodes()">
          <span>🎯</span> CYCLE CLIENTS
        </button>
        <button class="cam-btn" onclick="resetCameraView()">
          <span>🌐</span> OVERVIEW
        </button>
        <button class="cam-btn active" id="rotate-btn" onclick="toggleAutoRotate()">
          <span>🔄</span> ROTATION: ON
        </button>
      </div>

      <!-- Scrolling Event Ticker -->
      <div class="event-ticker interactive">
        <div class="ticker-label">
          <span class="ticker-dot"></span>
          <span>SYSTEM FEED</span>
        </div>
        <div class="ticker-content" id="ticker-feed">
          [INIT] ACCURATE GOOGLE EARTH 3D MESH MOUNTED // TRACERT ENGINE READY // STANDBY...
        </div>
      </div>
    </div>
  </div>

  <script>
    // ═══════════════════════════════════════════════════════════════════
    // PROCEDURAL WEB AUDIO SFX GENERATOR
    // ═══════════════════════════════════════════════════════════════════
    let audioCtx = null;
    let sfxEnabled = false;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    function toggleAudio() {
      initAudio();
      sfxEnabled = !sfxEnabled;
      document.getElementById('sfx-icon').innerText = sfxEnabled ? '🔊' : '🔈';
      document.getElementById('sfx-toggle').innerText = (sfxEnabled ? '🔊 SFX: ON' : '🔈 SFX: OFF');
      document.getElementById('sfx-toggle').classList.toggle('active', sfxEnabled);
      if (sfxEnabled) playBeep(880, 0.08, 'sine');
    }

    function playBeep(freq = 440, duration = 0.08, type = 'sine') {
      if (!sfxEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch {}
    }

    function playSelectSound() {
      if (!sfxEnabled || !audioCtx) return;
      playBeep(520, 0.05, 'triangle');
      setTimeout(() => playBeep(840, 0.08, 'sine'), 40);
    }

    function playCopySound() {
      if (!sfxEnabled || !audioCtx) return;
      playBeep(700, 0.04, 'sine');
      setTimeout(() => playBeep(1100, 0.06, 'sine'), 50);
    }

    function updateClock() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      document.getElementById('zulu-clock').innerText =
        \`\${pad(d.getUTCHours())}:\${pad(d.getUTCMinutes())}:\${pad(d.getUTCSeconds())}Z\`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function copyCliCmd() {
      const text = document.getElementById('cli-cmd-text').innerText;
      navigator.clipboard.writeText(text).then(() => {
        playCopySound();
        addTickerEvent('[CLIPBOARD] FORWARDING COMMAND COPIED TO BUFFER');
      });
    }

    function addTickerEvent(msg) {
      const d = new Date();
      const timeStr = d.toTimeString().split(' ')[0];
      document.getElementById('ticker-feed').innerText = \`[\${timeStr}] \${msg}\`;
    }

    // ═══════════════════════════════════════════════════════════════════
    // TOP PHYSICAL ADDRESS CARD CONTROLLER
    // ═══════════════════════════════════════════════════════════════════
    let isCardOpen = false;
    let currentLocationData = {
      address: "${initialAddress.replace(/"/g, '\\"')}",
      lat: ${serverGeo?.lat || 22.5696},
      lon: ${serverGeo?.lon || 88.3696},
      isp: "${(serverGeo?.isp || 'Switcher Relay Mesh').replace(/"/g, '\\"')}"
    };

    function toggleLocationCard() {
      isCardOpen = !isCardOpen;
      const card = document.getElementById('location-card');
      const arrow = document.getElementById('top-loc-arrow');
      card.style.display = isCardOpen ? 'flex' : 'none';
      arrow.style.transform = isCardOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      playSelectSound();
    }

    function updateTopAddress(data) {
      if (!data) return;
      const addr = data.address || \`\${data.city || 'Metro Area'}, \${data.country || 'Global'}\`;
      document.getElementById('top-address-text').innerText = addr;
      document.getElementById('card-full-address').innerText = addr;

      const lat = data.lat || 0;
      const lon = data.lon || 0;
      currentLocationData = {
        address: addr,
        lat,
        lon,
        isp: data.isp || 'Network Node'
      };

      document.getElementById('card-coords').innerText = \`\${lat.toFixed(4)}°, \${lon.toFixed(4)}°\`;
      document.getElementById('card-isp').innerText = data.isp || 'Network Node';
      document.getElementById('card-gearth-link').href = \`https://earth.google.com/web/@\${lat},\${lon},500a,35y,0h,45t,0r\`;
    }

    function copyAddress() {
      const addr = document.getElementById('card-full-address').innerText;
      navigator.clipboard.writeText(addr).then(() => {
        playCopySound();
        document.getElementById('copy-addr-text').innerText = 'COPIED!';
        setTimeout(() => document.getElementById('copy-addr-text').innerText = '📋 COPY ADDRESS', 2000);
        addTickerEvent(\`[ADDRESS_COPIED] \${addr}\`);
      });
    }

    // ═══════════════════════════════════════════════════════════════════
    // EMBEDDED GOOGLE EARTH 3D SATELLITE EXPLORER
    // ═══════════════════════════════════════════════════════════════════
    function openEmbeddedGoogleEarth(lat = currentLocationData.lat, lon = currentLocationData.lon) {
      const modal = document.getElementById('gearth-modal');
      const iframe = document.getElementById('gearth-iframe');
      const fsLink = document.getElementById('gearth-fullscreen-link');
      const coordsLbl = document.getElementById('gearth-coords-label');

      coordsLbl.innerText = \`\${lat.toFixed(4)}° N, \${lon.toFixed(4)}° E\`;
      fsLink.href = \`https://earth.google.com/web/@\${lat},\${lon},600a,35y,0h,45t,0r\`;

      // Embed high-resolution satellite imagery with street & building-level zoom
      const embedUrl = \`https://www.google.com/maps?q=\${lat},\${lon}&z=17&t=k&output=embed\`;
      iframe.src = embedUrl;

      modal.style.display = 'flex';
      playSelectSound();
      addTickerEvent(\`[GOOGLE_EARTH_3D] LAUNCHED SATELLITE EXPLORER FOR \${lat.toFixed(4)}°, \${lon.toFixed(4)}°\`);
    }

    function closeEmbeddedGoogleEarth() {
      document.getElementById('gearth-modal').style.display = 'none';
      document.getElementById('gearth-iframe').src = '';
      playSelectSound();
    }

    // ═══════════════════════════════════════════════════════════════════
    // THREE.JS ACCURATE GOOGLE EARTH 3D SATELLITE VISUALIZATION
    // ═══════════════════════════════════════════════════════════════════
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x01040a, 0.0012);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2500);
    camera.position.set(0, 40, 220);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Global Hierarchy
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const nodesGroup = new THREE.Group();
    globeGroup.add(nodesGroup);

    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);

    const tracertGroup = new THREE.Group();
    globeGroup.add(tracertGroup);

    const particlesGroup = new THREE.Group();
    globeGroup.add(particlesGroup);

    const GLOBE_RADIUS = 60;

    // ─── 1. Deep Space Starfield ───
    (function createStarfield() {
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1800;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        const r = 450 + Math.random() * 900;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        starPos[i] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i+2] = r * Math.cos(phi);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0x90caf9,
        size: 1.4,
        transparent: true,
        opacity: 0.85
      });
      scene.add(new THREE.Points(starGeo, starMat));
    })();

    // ─── 2. Accurate Earth Satellite Textures Loader ───
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    const TEX_SATELLITE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    const TEX_NIGHT     = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';
    const TEX_DARK      = 'https://unpkg.com/three-globe/example/img/earth-dark.jpg';
    const TEX_NORMAL    = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_normal_2048.jpg';
    const TEX_SPECULAR  = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_specular_2048.jpg';
    const TEX_CLOUDS    = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_1024.png';

    const satelliteTexture = textureLoader.load(TEX_SATELLITE, () => {
      addTickerEvent('[TEXTURE] GOOGLE EARTH SATELLITE IMAGERY LOADED');
    });
    const nightTexture     = textureLoader.load(TEX_NIGHT);
    const darkTexture      = textureLoader.load(TEX_DARK);
    const normalMap        = textureLoader.load(TEX_NORMAL);
    const specularMap      = textureLoader.load(TEX_SPECULAR);
    const cloudsTexture    = textureLoader.load(TEX_CLOUDS);

    // ─── 3. Accurate Earth Sphere Geometry & Realistic Materials ───
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128);

    const earthMat = new THREE.MeshPhongMaterial({
      map: satelliteTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: specularMap,
      specular: new THREE.Color(0x336699),
      shininess: 28,
      bumpMap: normalMap,
      bumpScale: 0.05
    });

    const globeMesh = new THREE.Mesh(globeGeo, earthMat);
    globeGroup.add(globeMesh);

    // ─── 4. Photorealistic Atmospheric Cloud Layer ───
    const cloudsGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 96, 96);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);

    // ─── 5. Realistic Atmosphere Glow Rim (Rayleigh Scattering) ───
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: \`
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      \`,
      fragmentShader: \`
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.12, 0.65, 1.0, 1.0) * intensity * 1.4;
        }
      \`,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // ─── 6. Tactical Coordinate Grid & Orbital Rings ───
    const gridGroup = new THREE.Group();
    globeGroup.add(gridGroup);

    function createTacticalGrid() {
      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = (90 - lat) * (Math.PI / 180);
        const ringR = GLOBE_RADIUS * 1.002 * Math.sin(phi);
        const y = GLOBE_RADIUS * 1.002 * Math.cos(phi);
        const ringGeo = new THREE.RingGeometry(ringR - 0.12, ringR + 0.12, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: lat === 0 ? 0x00f0ff : 0x0088cc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: lat === 0 ? 0.35 : 0.14
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = y;
        gridGroup.add(ringMesh);
      }

      const orbitGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.35, GLOBE_RADIUS * 1.36, 128);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22
      });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2.3;
      gridGroup.add(orbitMesh);
    }
    createTacticalGrid();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x223344, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(160, 90, 140);
    scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x00f0ff, 0.4);
    backLight.position.set(-160, -80, -120);
    scene.add(backLight);

    // ─── Map Styles ───
    function setMapStyle(style) {
      document.getElementById('btn-style-sat').classList.toggle('active', style === 'satellite');
      document.getElementById('btn-style-night').classList.toggle('active', style === 'night');
      document.getElementById('btn-style-dark').classList.toggle('active', style === 'dark');

      if (style === 'satellite') {
        earthMat.map = satelliteTexture;
        earthMat.normalMap = normalMap;
        earthMat.specularMap = specularMap;
        earthMat.color.setHex(0xffffff);
        earthMat.emissive.setHex(0x000000);
        addTickerEvent('[MAP_STYLE] SATELLITE GOOGLE EARTH HD ACTIVE');
      } else if (style === 'night') {
        earthMat.map = nightTexture;
        earthMat.normalMap = null;
        earthMat.specularMap = null;
        earthMat.color.setHex(0xffffff);
        earthMat.emissive.setHex(0x222222);
        addTickerEvent('[MAP_STYLE] BLACK MARBLE NIGHT LIGHTS ACTIVE');
      } else if (style === 'dark') {
        earthMat.map = darkTexture;
        earthMat.normalMap = normalMap;
        earthMat.specularMap = specularMap;
        earthMat.color.setHex(0x00f0ff);
        earthMat.emissive.setHex(0x020814);
        addTickerEvent('[MAP_STYLE] TACTICAL TOPOGRAPHY ACTIVE');
      }
      earthMat.needsUpdate = true;
      playSelectSound();
    }

    let cloudsVisible = true;
    function toggleClouds() {
      cloudsVisible = !cloudsVisible;
      cloudsMesh.visible = cloudsVisible;
      document.getElementById('btn-clouds').classList.toggle('active', cloudsVisible);
      document.getElementById('btn-clouds').innerHTML = cloudsVisible ? '<span>☁️</span> CLOUDS: ON' : '<span>☁️</span> CLOUDS: OFF';
      playSelectSound();
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPATIAL LAT/LON TO 3D COORDINATES
    // ═══════════════════════════════════════════════════════════════════
    function latLonToVector3(lat, lon, radius = GLOBE_RADIUS) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    }

    const activeNodes = [];
    const activeArcs = [];
    const photonPulses = [];
    let serverNodeData = null;
    let selectedNode = null;

    function makeTextSprite(message, colorHex = '#00e676') {
      const canvas = document.createElement('canvas');
      canvas.width = 340;
      canvas.height = 76;
      const ctx = canvas.getContext('2d');
      
      // Cyber rounded box
      ctx.fillStyle = 'rgba(2, 7, 18, 0.9)';
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 4;
      
      const x = 6, y = 6, w = 328, h = 64, r = 12;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing indicator dot
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(32, 38, 7, 0, Math.PI * 2);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText(message, 52, 46);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(14, 3.2, 1);
      return sprite;
    }

    function createPin(pos, colorHex = '#00f0ff', isServer = false, label = '') {
      const group = new THREE.Group();
      group.position.copy(pos);
      group.lookAt(0, 0, 0);

      const col = new THREE.Color(colorHex);

      const ringGeo = new THREE.RingGeometry(0.8, 1.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      const beamH = isServer ? 16 : 9;
      const beamGeo = new THREE.CylinderGeometry(0.15, 0.45, beamH, 16);
      beamGeo.translate(0, beamH / 2, 0);
      const beamMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.rotation.x = Math.PI / 2;
      group.add(beamMesh);

      const sphereGeo = new THREE.SphereGeometry(isServer ? 1.6 : 1.1, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: isServer ? 0xffffff : col });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.z = -beamH;
      group.add(sphereMesh);

      const sonarGeo = new THREE.RingGeometry(1.9, 2.3, 32);
      const sonarMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const sonarMesh = new THREE.Mesh(sonarGeo, sonarMat);
      group.add(sonarMesh);

      // Attached 3D Billboard Label Sprite
      if (label) {
        const sprite = makeTextSprite(label, colorHex);
        sprite.position.z = -(beamH + 4.5);
        group.add(sprite);
      }

      group.userData = {
        ringMesh,
        sonarMesh,
        beamMesh,
        sphereMesh,
        isServer,
        colorHex,
        sonarScale: 1
      };

      return group;
    }

    function createBezierArc(v1, v2, colorHex = '#00f0ff', tunnelId = '', isTracert = false) {
      const distance = v1.distanceTo(v2);
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);

      const altitude = GLOBE_RADIUS + (isTracert ? Math.min(distance * 0.25, 20) : Math.min(distance * 0.45, 45));
      mid.normalize().multiplyScalar(altitude);

      const ctrl1 = new THREE.Vector3().addVectors(v1, mid).multiplyScalar(0.5).normalize().multiplyScalar(altitude * 0.92);
      const ctrl2 = new THREE.Vector3().addVectors(v2, mid).multiplyScalar(0.5).normalize().multiplyScalar(altitude * 0.92);

      const curve = new THREE.CubicBezierCurve3(v1, ctrl1, ctrl2, v2);
      const points = curve.getPoints(isTracert ? 30 : 50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: isTracert ? 0.95 : 0.8,
        linewidth: isTracert ? 3 : 2
      });

      const line = new THREE.Line(geometry, material);
      line.userData = { curve, tunnelId, colorHex, isTracert };
      if (isTracert) {
        tracertGroup.add(line);
      } else {
        arcsGroup.add(line);
      }

      const pulseCount = Math.max(2, Math.min(7, Math.floor(distance / 18)));
      for (let i = 0; i < pulseCount; i++) {
        const pGeo = new THREE.SphereGeometry(isTracert ? 0.9 : 0.75, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex) });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        particlesGroup.add(pMesh);
        photonPulses.push({
          mesh: pMesh,
          curve,
          t: (i / pulseCount) + Math.random() * 0.1,
          speed: 0.0035 + Math.random() * 0.002
        });
      }

      return line;
    }

    // ═══════════════════════════════════════════════════════════════════
    // NATIVE TRACERT NETWORK ROUTE PATH ENGINE
    // ═══════════════════════════════════════════════════════════════════
    async function runNodeTracert(targetParam = null) {
      playSelectSound();
      const target = targetParam || selectedNode?.userData?.nodeData?.ip || serverNodeData?.ip || '8.8.8.8';
      const targetLabel = selectedNode?.userData?.nodeData?.name || target;

      const modal = document.getElementById('tracert-modal');
      const targetNameEl = document.getElementById('tracert-target-name');
      const hopsListEl = document.getElementById('tracert-hops-list');

      targetNameEl.innerText = \`\${targetLabel} (\${target})\`;
      modal.style.display = 'flex';
      hopsListEl.innerHTML = \`
        <div style="text-align:center; padding:1.5rem; color:var(--orange); font-family:var(--font-code); font-size:0.75rem;">
          <div style="margin-bottom:0.4rem; font-weight:700;">⚡ EXECUTING WINDOWS TRACERT...</div>
          <div>Tracing live network hops across optical gateways and internet exchanges...</div>
        </div>
      \`;

      addTickerEvent(\`[TRACERT_START] TRACING ROUTE TO \${target}...\`);

      try {
        const res = await fetch(\`/api/tracert?target=\${encodeURIComponent(target)}\`);
        if (!res.ok) throw new Error('Trace failed');
        const data = await res.json();
        renderTracertResults(data);
      } catch (err) {
        hopsListEl.innerHTML = \`<div style="color:#ff5252; padding:1rem; text-align:center;">Tracert failed: \${err.message}</div>\`;
      }
    }

    function renderTracertResults(data) {
      const hopsListEl = document.getElementById('tracert-hops-list');
      hopsListEl.innerHTML = '';

      // Clear previous tracert 3D lines
      while (tracertGroup.children.length > 0) tracertGroup.remove(tracertGroup.children[0]);

      if (!data.hops || data.hops.length === 0) {
        hopsListEl.innerHTML = '<div style="color:#ff5252; padding:1rem; text-align:center;">No hops detected</div>';
        return;
      }

      addTickerEvent(\`[TRACERT_DONE] DISCOVERED \${data.hops.length} HOPS TO \${data.target}\`);

      // Plot 3D Hops & Lines
      const hopVectors = [];

      data.hops.forEach((hop) => {
        const row = document.createElement('div');
        row.className = 'hop-row';
        row.innerHTML = \`
          <span class="hop-idx">#\${hop.hop}</span>
          <span class="hop-ip">\${hop.ip}</span>
          <span class="hop-rtt">\${hop.rttMs} ms</span>
          <span class="hop-geo" title="\${hop.city}, \${hop.country}">📍 \${hop.city || 'Hop'}</span>
        \`;
        row.onclick = () => {
          if (hop.lat && hop.lon) {
            focusCoordinates(hop.lat, hop.lon);
            updateTopAddress({ address: \`Router Hop #\${hop.hop}: \${hop.ip} (\${hop.city}, \${hop.country})\`, lat: hop.lat, lon: hop.lon, isp: hop.isp });
          }
        };
        hopsListEl.appendChild(row);

        if (typeof hop.lat === 'number' && typeof hop.lon === 'number') {
          const v = latLonToVector3(hop.lat, hop.lon);
          hopVectors.push({ v, hop });

          // Hop waypoint sphere on globe
          const hopGeo = new THREE.SphereGeometry(1.2, 12, 12);
          const hopMat = new THREE.MeshBasicMaterial({ color: 0xff6d00 });
          const hopMesh = new THREE.Mesh(hopGeo, hopMat);
          hopMesh.position.copy(v);
          tracertGroup.add(hopMesh);
        }
      });

      // Connect hops sequentially with glowing orange pivot lines
      for (let i = 0; i < hopVectors.length - 1; i++) {
        createBezierArc(hopVectors[i].v, hopVectors[i+1].v, '#ff6d00', \`hop-\${i}\`, true);
      }
    }

    function closeTracertModal() {
      document.getElementById('tracert-modal').style.display = 'none';
      while (tracertGroup.children.length > 0) tracertGroup.remove(tracertGroup.children[0]);
    }

    // ═══════════════════════════════════════════════════════════════════
    // DATA SYNC & HUD UPDATES
    // ═══════════════════════════════════════════════════════════════════
    let lastGraphData = null;

    async function fetchTelemetry() {
      try {
        const res = await fetch('/api/telemetry');
        if (!res.ok) return;
        const data = await res.json();
        updateNetworkGraph(data);
      } catch (err) {
        console.warn('Telemetry poll error:', err);
      }
    }

    function openPortsModal() {
      const modal = document.getElementById('ports-modal');
      const countEl = document.getElementById('ports-modal-count');
      const tableBody = document.getElementById('ports-modal-table-body');
      
      const projects = (lastGraphData && (lastGraphData.projects || lastGraphData.triangulation?.hostPc?.projects)) || [];
      const count = projects.length + 1; // including relay core hub port
      countEl.innerText = count + ' ACTIVE PORTS';
      
      let html = '';
      
      // Relay Port row
      const relayPort = lastGraphData?.server?.port || 8080;
      html += \`
        <div class="port-modal-row" style="border-left: 3px solid var(--gold);">
          <div style="display:flex; flex-direction:column; gap:0.2rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-family:var(--font-display); font-weight:700; color:var(--gold); font-size:0.85rem;">ONRENDER SERVER HUB</span>
              <span class="port-open-badge" style="border-color:var(--gold); color:var(--gold); background:rgba(255,183,0,0.1);">● PORT :\${relayPort} OPEN</span>
            </div>
            <div style="font-family:var(--font-code); font-size:0.72rem; color:var(--text-muted);">
              HOST: 0.0.0.0:\${relayPort} // PROTO: HTTP/1.1, WebSocket, Raw TCP
            </div>
            <div style="font-size:0.68rem; color:#78909c;">
              📍 \${lastGraphData?.triangulation?.renderServer?.location?.address || 'Render Cloud Datacenter, San Francisco, California, US'}
            </div>
          </div>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn-action" onclick="focusRenderServer(); closePortsModal();" style="border-color:var(--gold); color:var(--gold);">FOCUS RENDER</button>
          </div>
        </div>
      \`;

      // Host PC Projects Open Ports
      projects.forEach((p) => {
        const color = p.color || '#00e676';
        html += \`
          <div class="port-modal-row" style="border-left: 3px solid \${color};">
            <div style="display:flex; flex-direction:column; gap:0.25rem;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-family:var(--font-display); font-weight:700; color:#fff; font-size:0.85rem;">\${p.projectName || p.tunnelId}</span>
                <span class="port-open-badge" style="border-color:\${color}; color:\${color};">● OPEN PORT :\${p.localPort}</span>
                <span class="tunnel-proto">\${p.proto || 'http'}</span>
              </div>
              <div style="font-family:var(--font-code); font-size:0.72rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
                <span style="color:var(--green); font-weight:700;">localhost:\${p.localPort}</span>
                <span>──►</span>
                <span style="color:var(--cyan);">\${p.subpathUrl}</span>
              </div>
              <div style="font-size:0.68rem; color:#78909c;">
                📍 Hosted on Host PC (switcher-tunnel.bat) • Port :\${p.localPort}
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.35rem;">
              <div style="display:flex; gap:0.35rem;">
                <a href="\${p.publicUrl}" target="_blank" class="btn-action" style="padding:0.3rem 0.55rem;">OPEN ↗</a>
                <button class="btn-action" onclick="copyUrl('\${p.publicUrl}')" style="padding:0.3rem 0.55rem;">COPY</button>
              </div>
              <div style="display:flex; gap:0.35rem;">
                <button class="btn-action" onclick="focusHostPc(); closePortsModal();" style="padding:0.3rem 0.55rem;">FOCUS PC</button>
                <button class="btn-action btn-close-action" onclick="closeTunnelRemote('\${p.tunnelId}', \${p.localPort})" style="padding:0.3rem 0.55rem;">CLOSE ✕</button>
              </div>
            </div>
          </div>
        \`;
      });

      tableBody.innerHTML = html;
      modal.style.display = 'flex';
      playSelectSound();
      addTickerEvent('[PORTS_MATRIX] OPENED ACTIVE PORTS CONSOLE');
    }

    function closePortsModal() {
      document.getElementById('ports-modal').style.display = 'none';
      playSelectSound();
    }

    function updateNetworkGraph(data) {
      if (!data) return;
      lastGraphData = data;

      const hostPcData = data.triangulation?.hostPc || data.hostPc || {};
      const renderServerData = data.triangulation?.renderServer || data.server || {};
      const webClientData = data.triangulation?.webClient || data.webClient || {};
      const projects = hostPcData.projects || data.projects || [];

      document.getElementById('hud-tunnel-count').innerText = projects.length || 0;
      document.getElementById('panel-tunnel-count').innerText = '3 NODES (' + (projects.length || 0) + ' PORTS)';
      if (typeof data.avgLatencyMs === 'number') {
        document.getElementById('hud-ping').innerText = data.avgLatencyMs + ' ms';
      }

      // Render quick open port chips in left panel
      const chipsEl = document.getElementById('ports-chips-list');
      if (chipsEl) {
        chipsEl.innerHTML = '';
        projects.forEach(p => {
          const chip = document.createElement('span');
          chip.className = 'port-chip-tag';
          chip.innerText = ':' + p.localPort;
          chip.title = 'Open port ' + p.localPort + ' (' + p.tunnelId + ') on Host PC';
          chip.onclick = () => focusHostPc();
          chipsEl.appendChild(chip);
        });
      }

      // Update top header open ports badge
      const topOpenPortsEl = document.getElementById('hud-open-ports');
      if (topOpenPortsEl) {
        const portsList = projects.map(p => ':' + p.localPort);
        topOpenPortsEl.innerText = portsList.length > 0 ? (portsList.length + ' PORTS (' + portsList.join(', ') + ')') : '0 ACTIVE';
      }

      while (nodesGroup.children.length > 0) nodesGroup.remove(nodesGroup.children[0]);
      while (arcsGroup.children.length > 0) arcsGroup.remove(arcsGroup.children[0]);
      while (particlesGroup.children.length > 0) particlesGroup.remove(particlesGroup.children[0]);
      activeNodes.length = 0;
      activeArcs.length = 0;
      photonPulses.length = 0;

      // ─── 1. NODE 1: SWITCHER-TUNNEL (HOST PC) ───
      const pcLoc = hostPcData.location || { lat: 22.5696, lon: 88.3696, city: 'Kolkata', country: 'India' };
      const pcPos = latLonToVector3(pcLoc.lat, pcLoc.lon);
      const pcPorts = projects.map(p => ':' + p.localPort);
      const pcLabel = pcPorts.length > 0 ? ('💻 HOST PC (' + pcPorts.join(', ') + ')') : '💻 HOST PC (OFFLINE)';
      const pcPin = createPin(pcPos, '#00e676', false, pcLabel);
      pcPin.userData.nodeData = {
        name: 'SWITCHER-TUNNEL // HOST PC',
        nodeType: 'host_pc',
        role: 'host_pc',
        script: 'switcher-tunnel.bat',
        ip: hostPcData.ip || '106.219.132.148',
        city: pcLoc.city || 'Kolkata',
        country: pcLoc.country || 'India',
        address: pcLoc.address || (pcLoc.city + ', ' + pcLoc.country),
        coords: pcLoc.lat.toFixed(4) + '°, ' + pcLoc.lon.toFixed(4) + '°',
        route: 'switcher-tunnel.bat ──► Onrender Server',
        isp: pcLoc.isp || 'Host PC Internet / Airtel',
        lat: pcLoc.lat,
        lon: pcLoc.lon,
        isServer: false,
        color: '#00e676',
        projects: projects,
        distToRender: hostPcData.distanceToRenderKm || 0
      };
      nodesGroup.add(pcPin);
      activeNodes.push(pcPin);

      // ─── 2. NODE 2: ONRENDER SERVER (CLOUD RELAY) ───
      const renderLoc = renderServerData.location || { lat: 50.1109, lon: 8.6821, city: 'Frankfurt', country: 'Germany' };
      const renderPos = latLonToVector3(renderLoc.lat, renderLoc.lon);
      const renderPin = createPin(renderPos, '#ffd600', true, '☁️ ONRENDER RELAY (:8080)');
      renderPin.userData.nodeData = {
        name: 'ONRENDER SERVER // CLOUD RELAY',
        nodeType: 'render_server',
        role: 'render_server',
        host: renderServerData.host || 'switcher-tunnel.onrender.com',
        localPort: renderServerData.port || 8080,
        ip: renderServerData.ip || '216.24.57.1',
        city: renderLoc.city || 'Frankfurt',
        country: renderLoc.country || 'Germany',
        address: renderLoc.address || (renderLoc.city + ', ' + renderLoc.country),
        coords: renderLoc.lat.toFixed(4) + '°, ' + renderLoc.lon.toFixed(4) + '°',
        route: 'https://' + (renderServerData.host || 'switcher-tunnel.onrender.com'),
        isp: renderLoc.isp || 'Render Cloud Infrastructure (AWS eu-central-1)',
        lat: renderLoc.lat,
        lon: renderLoc.lon,
        isServer: true,
        color: '#ffd600',
        distToWeb: renderServerData.distanceToWebKm || 0
      };
      nodesGroup.add(renderPin);
      activeNodes.push(renderPin);
      serverNodeData = renderPin.userData.nodeData;

      // ─── 3. NODE 3: CLIENT WEB LOCATION (BROWSER VISITOR) ───
      const webLoc = webClientData.location || { lat: 51.5074, lon: -0.1278, city: 'London', country: 'United Kingdom' };
      const webPos = latLonToVector3(webLoc.lat, webLoc.lon);
      const webPin = createPin(webPos, '#ff007f', false, '📱 CLIENT WEB (BROWSER)');
      webPin.userData.nodeData = {
        name: 'CLIENT WEB // BROWSER VISITOR',
        nodeType: 'web_client',
        role: 'web_client',
        ip: webClientData.ip || 'Browser Visitor',
        city: webLoc.city || 'London',
        country: webLoc.country || 'United Kingdom',
        address: webLoc.address || (webLoc.city + ', ' + webLoc.country),
        coords: webLoc.lat.toFixed(4) + '°, ' + webLoc.lon.toFixed(4) + '°',
        route: 'Web Browser ──► Render Relay ──► Host PC',
        isp: webLoc.isp || 'Active Web Consumer Browser',
        lat: webLoc.lat,
        lon: webLoc.lon,
        isServer: false,
        color: '#ff007f',
        distToPc: webClientData.distanceToPcKm || 0
      };
      nodesGroup.add(webPin);
      activeNodes.push(webPin);

      // ─── 4. TRIANGULATING NETWORK ARCS ───
      // Leg 1: switcher-tunnel location -> onrender server location (Uplink)
      const arc1 = createBezierArc(pcPos, renderPos, '#00e676', 'pc-to-render');
      // Leg 2: onrender server location -> client web location (Downlink)
      const arc2 = createBezierArc(renderPos, webPos, '#ffd600', 'render-to-web');
      // Leg 3: client web location -> switcher-tunnel location (Triangulation Loop)
      const arc3 = createBezierArc(webPos, pcPos, '#ff007f', 'web-to-pc');
      activeArcs.push(arc1, arc2, arc3);

      // ─── 5. LEFT PANEL: RENDER THE 3 TRIANGULATION CARDS ───
      const tunnelListEl = document.getElementById('tunnels-list');
      tunnelListEl.innerHTML = '';

      // Card 1: SWITCHER-TUNNEL (HOST PC)
      const cardPc = document.createElement('div');
      cardPc.className = 'tunnel-card';
      cardPc.style.borderLeftColor = '#00e676';
      let projectsHtml = '';
      if (projects.length === 0) {
        projectsHtml = '<div style="font-size:0.72rem; color:var(--text-muted); padding:0.4rem 0;">No active projects. Launch on PC: <code>switcher-tunnel 3000</code></div>';
      } else {
        projectsHtml = '<div class="host-ports-list">' + projects.map(p => \`
          <div class="host-port-item">
            <div class="host-port-info">
              <span class="host-port-val">:\${p.localPort}</span>
              <span style="color:#fff; font-weight:600;">\${p.tunnelId}</span>
              <span style="color:var(--cyan); font-size:0.68rem;">──►</span>
              <a href="\${p.publicUrl}" target="_blank" class="host-port-url" title="\${p.publicUrl}">\${p.subpathUrl}</a>
            </div>
            <div class="host-port-actions">
              <button class="btn-action" onclick="event.stopPropagation(); copyUrl('\${p.publicUrl}')" style="padding:0.2rem 0.4rem; font-size:0.58rem;">COPY</button>
              <a href="\${p.publicUrl}" target="_blank" class="btn-action" onclick="event.stopPropagation();" style="padding:0.2rem 0.4rem; font-size:0.58rem;">OPEN ↗</a>
              <button class="btn-action btn-close-action" onclick="event.stopPropagation(); closeTunnelRemote('\${p.tunnelId}', \${p.localPort})" style="padding:0.2rem 0.4rem; font-size:0.58rem;">✕</button>
            </div>
          </div>
        \`).join('') + '</div>';
      }

      cardPc.innerHTML = \`
        <div class="tunnel-header">
          <div style="display:flex; align-items:center; gap:0.45rem;">
            <span class="tunnel-id" style="color:#00e676;">💻 SWITCHER-TUNNEL</span>
            <span class="port-open-badge" style="border-color:#00e676; color:#00e676;">HOST PC</span>
          </div>
          <span class="tunnel-proto">PC DAEMON</span>
        </div>
        <div style="font-family:var(--font-code); font-size:0.7rem; color:var(--text-muted); margin-bottom:0.3rem;">
          SCRIPT: <span style="color:#fff;">switcher-tunnel.bat</span> • IP: <span style="color:var(--cyan);">\${pcPin.userData.nodeData.ip}</span>
        </div>
        <div class="tunnel-geo">
          <span>📍 \${pcLoc.city}, \${pcLoc.country}</span>
          <span class="tri-dist-tag">⚡ \${pcPin.userData.nodeData.distToRender} km to Render</span>
        </div>
        \${projectsHtml}
        <div class="tunnel-actions">
          <button class="btn-action" onclick="focusNode(activeNodes[0])">FOCUS PC</button>
          <button class="btn-action btn-tracert-action" onclick="runNodeTracert('host-pc')">TRACERT</button>
        </div>
      \`;
      cardPc.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') focusNode(pcPin);
      };
      tunnelListEl.appendChild(cardPc);

      // Card 2: ONRENDER SERVER (CLOUD RELAY)
      const cardRender = document.createElement('div');
      cardRender.className = 'tunnel-card';
      cardRender.style.borderLeftColor = '#ffd600';
      cardRender.innerHTML = \`
        <div class="tunnel-header">
          <div style="display:flex; align-items:center; gap:0.45rem;">
            <span class="tunnel-id" style="color:#ffd600;">☁️ ONRENDER SERVER</span>
            <span class="port-open-badge" style="border-color:#ffd600; color:#ffd600;">CLOUD RELAY</span>
          </div>
          <span class="tunnel-proto">CORE HUB</span>
        </div>
        <div style="font-family:var(--font-code); font-size:0.7rem; color:var(--text-muted); margin-bottom:0.3rem;">
          HOST: <span style="color:#fff;">\${renderPin.userData.nodeData.host}</span> • PORT: <span style="color:var(--gold);">:8080</span>
        </div>
        <div class="tunnel-geo">
          <span>📍 \${renderLoc.city}, \${renderLoc.country} (Datacenter)</span>
          <span class="tri-dist-tag">⚡ \${renderPin.userData.nodeData.distToWeb} km to Web</span>
        </div>
        <div class="tunnel-actions" style="margin-top:0.45rem;">
          <button class="btn-action" onclick="focusNode(activeNodes[1])">FOCUS RENDER</button>
          <button class="btn-action btn-tracert-action" onclick="runNodeTracert('render-server')">TRACERT</button>
        </div>
      \`;
      cardRender.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') focusNode(renderPin);
      };
      tunnelListEl.appendChild(cardRender);

      // Card 3: CLIENT WEB (BROWSER VISITOR)
      const cardWeb = document.createElement('div');
      cardWeb.className = 'tunnel-card';
      cardWeb.style.borderLeftColor = '#ff007f';
      cardWeb.innerHTML = \`
        <div class="tunnel-header">
          <div style="display:flex; align-items:center; gap:0.45rem;">
            <span class="tunnel-id" style="color:#ff007f;">📱 CLIENT WEB</span>
            <span class="port-open-badge" style="border-color:#ff007f; color:#ff007f;">BROWSER</span>
          </div>
          <span class="tunnel-proto">VISITOR</span>
        </div>
        <div style="font-family:var(--font-code); font-size:0.7rem; color:var(--text-muted); margin-bottom:0.3rem;">
          ROLE: <span style="color:#fff;">Active Dashboard Viewer</span> • IP: <span style="color:var(--cyan);">\${webPin.userData.nodeData.ip}</span>
        </div>
        <div class="tunnel-geo">
          <span>📍 \${webLoc.city}, \${webLoc.country}</span>
          <span class="tri-dist-tag">⚡ \${webPin.userData.nodeData.distToPc} km loop</span>
        </div>
        <div class="tunnel-actions" style="margin-top:0.45rem;">
          <button class="btn-action" onclick="focusNode(activeNodes[2])">FOCUS WEB</button>
          <button class="btn-action" onclick="detectBrowserLocation()" style="border-color:#ff007f; color:#ff007f;">📍 DETECT MY GPS</button>
        </div>
      \`;
      cardWeb.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') focusNode(webPin);
      };
      tunnelListEl.appendChild(cardWeb);

      if (!selectedNode) {
        inspectNode(pcPin.userData.nodeData);
      }
    }

    function focusHostPc() {
      if (activeNodes[0]) focusNode(activeNodes[0]);
    }

    function focusRenderServer() {
      if (activeNodes[1]) focusNode(activeNodes[1]);
    }

    function focusWebClient() {
      if (activeNodes[2]) focusNode(activeNodes[2]);
    }

    function focusTriangulationView() {
      playSelectSound();
      addTickerEvent('[CAMERA] CENTERING ON 3-WAY TRIANGULATION MESH');
      if (lastGraphData?.triangulation) {
        const pc = lastGraphData.triangulation.hostPc?.location || { lat: 22.5696, lon: 88.3696 };
        const render = lastGraphData.triangulation.renderServer?.location || { lat: 50.1109, lon: 8.6821 };
        const web = lastGraphData.triangulation.webClient?.location || { lat: 51.5074, lon: -0.1278 };
        const avgLat = (pc.lat + render.lat + web.lat) / 3;
        const avgLon = (pc.lon + render.lon + web.lon) / 3;
        focusCoordinates(avgLat, avgLon);
        cameraDistance = 210;
      }
    }

    function detectBrowserLocation() {
      playSelectSound();
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      addTickerEvent('[GEOLOCATION] ACQUIRING CLIENT BROWSER GPS FIX...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          addTickerEvent('[GPS_FIX] BROWSER LOCATED: ' + lat.toFixed(4) + '°, ' + lon.toFixed(4) + '°');
          try {
            const res = await fetch('/api/client-geo?lat=' + lat + '&lon=' + lon);
            const d = await res.json();
            if (d.success) {
              playBeep(880, 0.15, 'sine');
              fetchTelemetry();
            }
          } catch (err) {
            console.error(err);
          }
        },
        (err) => {
          addTickerEvent('[GPS_ERROR] ' + err.message);
          alert('Could not acquire GPS: ' + err.message + '. Keeping default client node.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }

    function copyUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        playCopySound();
        addTickerEvent(\`[LINK_COPIED] \${url}\`);
      });
    }

    function inspectNode(data) {
      if (!data) return;
      document.getElementById('insp-name').innerText = data.name;
      document.getElementById('insp-name').style.color = data.color || (data.isServer ? 'var(--gold)' : 'var(--green)');
      document.getElementById('insp-ip').innerText = data.ip || '--';
      document.getElementById('insp-geo').innerText = (data.city || 'Unknown') + ', ' + (data.country || 'Global');
      document.getElementById('insp-coords').innerText = data.coords || '--';
      document.getElementById('insp-route').innerText = data.route || '--';
      document.getElementById('insp-isp').innerText = data.isp || '--';

      const portBadge = document.getElementById('insp-port-badge');
      const portState = document.getElementById('insp-port-state');
      if (portBadge && portState) {
        if (data.nodeType === 'render_server' || data.isServer) {
          portBadge.innerText = '● PORT :' + (data.localPort || 8080) + ' (CORE RELAY HUB)';
          portBadge.style.color = 'var(--gold)';
          portState.innerText = 'LISTENING';
          portState.style.color = 'var(--gold)';
          portState.style.borderColor = 'var(--gold)';
        } else if (data.nodeType === 'host_pc') {
          const ports = (data.projects || []).map(p => ':' + p.localPort);
          portBadge.innerText = '● PORTS ' + (ports.length > 0 ? ports.join(', ') : ':3000') + ' (HOST PC)';
          portBadge.style.color = 'var(--green)';
          portState.innerText = 'ONLINE';
          portState.style.color = 'var(--green)';
          portState.style.borderColor = 'var(--green)';
        } else {
          portBadge.innerText = '● CLIENT VIEWER (ACTIVE)';
          portBadge.style.color = 'var(--magenta)';
          portState.innerText = 'CONNECTED';
          portState.style.color = 'var(--magenta)';
          portState.style.borderColor = 'var(--magenta)';
        }
      }

      updateTopAddress(data);

      const badge = document.getElementById('inspector-badge');
      if (data.nodeType === 'render_server' || data.isServer) {
        badge.innerText = 'RELAY HUB';
        badge.style.borderColor = 'var(--gold)';
        badge.style.color = 'var(--gold)';
      } else if (data.nodeType === 'host_pc') {
        badge.innerText = 'HOST PC';
        badge.style.borderColor = 'var(--green)';
        badge.style.color = 'var(--green)';
      } else {
        badge.innerText = 'CLIENT WEB';
        badge.style.borderColor = 'var(--magenta)';
        badge.style.color = 'var(--magenta)';
      }

      const inspCloseBtn = document.getElementById('insp-close-btn');
      if (inspCloseBtn) {
        inspCloseBtn.style.display = (data.nodeType === 'host_pc' && data.projects?.length > 0) ? 'block' : 'none';
        inspCloseBtn.innerText = '🛑 CLOSE ALL TUNNELS ON PC';
      }
    }

    async function closeTunnelRemote(tunnelId, port, killApp = true) {
      playBeep(240, 0.15, 'sawtooth');
      const confirmMsg = "🛑 CLOSE TUNNEL & RELEASE PORT?\\n\\nThis will disconnect '" + tunnelId + "', release local port :" + (port || 'active') + ", and close the hosting application process on the PC.\\n\\nProceed?";
      if (!confirm(confirmMsg)) return;

      addTickerEvent(\`[CLOSE_SIGNAL] TRANSMITTING REMOTE CLOSE FOR \${tunnelId} (PORT :\${port})...\`);
      try {
        const res = await fetch(\`/api/tunnel/close?tunnelId=\${encodeURIComponent(tunnelId)}&killApp=\${killApp}\`);
        const data = await res.json();
        if (data.success) {
          playBeep(440, 0.2, 'square');
          addTickerEvent(\`[CLOSED] TUNNEL \${tunnelId} (PORT :\${port}) TERMINATED ON PC\`);
          fetchTelemetry();
          if (document.getElementById('ports-modal').style.display === 'flex') {
            setTimeout(openPortsModal, 300);
          }
        } else {
          alert('Close failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Network error closing tunnel: ' + err.message);
      }
    }

    function closeCurrentInspectedNode() {
      if (selectedNode && selectedNode.userData?.nodeData && !selectedNode.userData.isServer) {
        const d = selectedNode.userData.nodeData;
        closeTunnelRemote(d.tunnelId, d.localPort);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // INTERACTIVE CAMERA CONTROLS & CINEMATIC GLIDE
    // ═══════════════════════════════════════════════════════════════════
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let autoRotate = true;
    let targetCamPos = null;
    let targetRotationY = null;
    let targetRotationX = null;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        globeGroup.rotation.y += dx * 0.005;
        globeGroup.rotation.x += dy * 0.005;
        globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));
      }
      checkRaycast(e);
    });

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => isDragging = false);

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - prevMouseX;
        const dy = e.touches[0].clientY - prevMouseY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;

        globeGroup.rotation.y += dx * 0.006;
        globeGroup.rotation.x += dy * 0.006;
        globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));
      }
    }, { passive: true });

    window.addEventListener('wheel', (e) => {
      camera.position.z += e.deltaY * 0.14;
      camera.position.z = Math.max(78, Math.min(360, camera.position.z));
    }, { passive: true });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('node-tooltip');

    function checkRaycast(e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(nodesGroup.children, true);
      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.nodeData && parent.parent) {
          parent = parent.parent;
        }

        if (parent && parent.userData?.nodeData) {
          const d = parent.userData.nodeData;
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX + 'px';
          tooltip.style.top = e.clientY + 'px';
          document.getElementById('tt-title').innerText = d.name;
          document.getElementById('tt-ip').innerText = 'IP: ' + d.ip;
          document.getElementById('tt-location').innerText = \`📍 \${d.city}, \${d.country}\`;
          document.getElementById('tt-route').innerText = d.route;
          container.style.cursor = 'pointer';
          return;
        }
      }

      tooltip.style.display = 'none';
      container.style.cursor = isDragging ? 'grabbing' : 'grab';
    }

    container.addEventListener('click', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesGroup.children, true);
      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.nodeData && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.nodeData) {
          focusNode(parent);
        }
      }
    });

    function focusNode(nodeGroup) {
      if (!nodeGroup) return;
      selectedNode = nodeGroup;
      const data = nodeGroup.userData.nodeData;
      inspectNode(data);
      playSelectSound();
      addTickerEvent(\`[TARGET_LOCK] FOCUSED NODE: \${data.name} // IP: \${data.ip}\`);

      const nodePos = nodeGroup.position.clone();
      const phi = Math.atan2(nodePos.x, nodePos.z);
      const theta = Math.asin(nodePos.y / GLOBE_RADIUS);

      targetRotationY = -phi;
      targetRotationX = theta * 0.75;
      targetCamPos = new THREE.Vector3(0, 30, 145);
    }

    function focusCoordinates(lat, lon) {
      const pos = latLonToVector3(lat, lon);
      const phi = Math.atan2(pos.x, pos.z);
      const theta = Math.asin(pos.y / GLOBE_RADIUS);

      targetRotationY = -phi;
      targetRotationX = theta * 0.75;
      targetCamPos = new THREE.Vector3(0, 30, 145);
    }

    function focusMainSystem() {
      if (activeNodes.length > 0) {
        focusNode(activeNodes[0]);
      }
    }

    let clientCycleIndex = 0;
    function cycleClientNodes() {
      const clientNodes = activeNodes.filter(n => !n.userData?.isServer);
      if (clientNodes.length === 0) {
        addTickerEvent('[WARNING] NO CLIENT NODES CURRENTLY LINKED');
        playBeep(300, 0.1, 'sawtooth');
        return;
      }
      clientCycleIndex = (clientCycleIndex + 1) % clientNodes.length;
      focusNode(clientNodes[clientCycleIndex]);
    }

    function focusNodeByTunnelId(tid) {
      const target = activeNodes.find(n => n.userData?.nodeData?.tunnelId === tid);
      if (target) focusNode(target);
    }

    function resetCameraView() {
      targetCamPos = new THREE.Vector3(0, 40, 220);
      targetRotationX = 0;
      targetRotationY = 0;
      selectedNode = null;
      playSelectSound();
      addTickerEvent('[CAMERA] RESET TO GLOBAL OVERVIEW');
    }

    function toggleAutoRotate() {
      autoRotate = !autoRotate;
      document.getElementById('rotate-btn').classList.toggle('active', autoRotate);
      document.getElementById('rotate-btn').innerHTML = autoRotate ? '<span>🔄</span> ROTATION: ON' : '<span>🔄</span> ROTATION: OFF';
    }

    // ═══════════════════════════════════════════════════════════════════
    // ANIMATION & RENDER LOOP
    // ═══════════════════════════════════════════════════════════════════
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging && targetRotationY === null) {
        globeGroup.rotation.y += 0.0012;
      }

      if (cloudsMesh) {
        cloudsMesh.rotation.y += 0.0003;
      }

      if (targetRotationY !== null) {
        globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.055;
        if (targetRotationX !== null) {
          globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.055;
        }
        if (Math.abs(targetRotationY - globeGroup.rotation.y) < 0.002) {
          targetRotationY = null;
          targetRotationX = null;
        }
      }

      if (targetCamPos) {
        camera.position.lerp(targetCamPos, 0.055);
        if (camera.position.distanceTo(targetCamPos) < 1) targetCamPos = null;
      }

      for (const node of activeNodes) {
        const u = node.userData;
        if (u.sonarMesh) {
          u.sonarScale += delta * 1.6;
          if (u.sonarScale > 3.2) u.sonarScale = 1;
          u.sonarMesh.scale.set(u.sonarScale, u.sonarScale, 1);
          u.sonarMesh.material.opacity = Math.max(0, 1 - (u.sonarScale - 1) / 2.2);
        }
      }

      for (const p of photonPulses) {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        const pt = p.curve.getPoint(p.t);
        p.mesh.position.copy(pt);
      }

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ═══════════════════════════════════════════════════════════════════
    // LIVE WEBSOCKET & TELEMETRY STREAM
    // ═══════════════════════════════════════════════════════════════════
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = \`\${proto}//\${location.host}/switcher-control?client=web-dashboard\`;
    let ws = null;
    let pingStart = 0;

    function connectLiveStream() {
      try {
        ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          addTickerEvent('[WS_STREAM] REAL-TIME RELAY TELEMETRY LINKED');
          setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              pingStart = performance.now();
              ws.send(JSON.stringify({ t: 1, ts: Date.now() }));
            }
          }, 2500);
        };

        ws.onmessage = (evt) => {
          if (typeof evt.data === 'string') {
            try {
              const msg = JSON.parse(evt.data);
              if (msg.type === 'GRAPH_UPDATE') {
                updateNetworkGraph(msg);
                playBeep(980, 0.05, 'sine');
                addTickerEvent(\`[NODE_SYNC] NETWORK GRAPH UPDATED // \${msg.tunnelsCount} ACTIVE\`);
                return;
              }
            } catch {}
          }
          const rtt = Math.round(performance.now() - pingStart);
          document.getElementById('hud-ping').innerText = rtt + ' ms';
        };

        ws.onclose = () => {
          setTimeout(connectLiveStream, 3500);
        };
      } catch (e) {
        setTimeout(connectLiveStream, 5000);
      }
    }

    fetchTelemetry();
    connectLiveStream();
    setInterval(fetchTelemetry, 3500);
  </script>
</body>
</html>`;
}

export function renderNotFoundHtml({ requestedId = 'unknown', serverHost = 'localhost:8080' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tunnel Offline | Switcher Tunnel</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      background: #01040a;
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
      background: rgba(4, 10, 22, 0.88);
      border: 1px solid rgba(255, 23, 68, 0.35);
      border-radius: 14px;
      padding: 2.5rem;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.75);
      backdrop-filter: blur(18px);
    }
    h2 { font-family: 'Orbitron', monospace; color: #ff1744; font-size: 1.3rem; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
    p { color: #90a4ae; line-height: 1.5; margin-bottom: 1.5rem; }
    code { background: #010307; color: #00f0ff; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }
    .cmd { background: #010307; border: 1px solid rgba(0,240,255,0.15); padding: 0.8rem; border-radius: 8px; font-family: 'JetBrains Mono', monospace; color: #00e676; font-size: 0.85rem; }
    .back-btn { margin-top: 1.5rem; display: inline-block; color: #00f0ff; text-decoration: none; font-family: 'Orbitron', monospace; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="box">
    <h2>TUNNEL OFFLINE</h2>
    <p>Tunnel <code>${requestedId}</code> is not connected to this relay.</p>
    <div class="cmd">switcher-tunnel 3000 --subdomain ${requestedId} --server https://${serverHost}</div>
    <a href="/" class="back-btn">← RETURN TO GOOGLE EARTH 3D MAP</a>
  </div>
</body>
</html>`;
}
