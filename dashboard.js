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
  <!-- SGP4 Real-Time Satellite Orbital Propagation Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/satellite.js/5.0.0/satellite.min.js"></script>

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
      width: 44px;
      height: 44px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.45));
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .brand-logo:hover {
      transform: scale(1.14) rotate(4deg);
      filter: drop-shadow(0 0 16px rgba(0, 240, 255, 0.85)) drop-shadow(0 0 8px rgba(255, 183, 0, 0.6));
    }

    .satellite-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
      animation: satOrbitFloat 4.2s ease-in-out infinite;
    }

    @keyframes satOrbitFloat {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-2.5px) rotate(2deg);
      }
    }

    .sat-beacon {
      animation: beaconFlash 1.4s infinite ease-in-out;
    }

    @keyframes beaconFlash {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 1; }
    }

    .sat-beacon-ring {
      animation: beaconRipple 1.6s infinite ease-out;
      transform-origin: 50px 11px;
    }

    @keyframes beaconRipple {
      0% { r: 2.2px; opacity: 0.9; }
      100% { r: 8px; opacity: 0; }
    }

    .sat-thruster-plume {
      animation: thrusterPulse 0.9s infinite alternate ease-in-out;
      transform-origin: 43px 66px;
    }

    @keyframes thrusterPulse {
      0% { opacity: 0.55; transform: scale(0.92); }
      100% { opacity: 1; transform: scale(1.18); }
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
    /* ═══════════════════════════════════════════════════════════════════
       LIVE SATELLITES COMMAND NET MODAL & CONTROLS
       ═══════════════════════════════════════════════════════════════════ */
    #satellites-modal {
      position: absolute;
      top: 75px;
      right: 25px;
      width: 440px;
      max-height: calc(100vh - 160px);
      background: rgba(2, 6, 16, 0.96);
      backdrop-filter: blur(24px);
      border: 1px solid var(--cyan);
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.25);
      display: none;
      flex-direction: column;
      z-index: 120;
      overflow: hidden;
      animation: modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalSlideIn {
      from { opacity: 0; transform: translateY(-12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sat-header {
      padding: 0.85rem 1.2rem;
      background: rgba(0, 240, 255, 0.08);
      border-bottom: 1px solid rgba(0, 240, 255, 0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sat-title {
      font-family: var(--font-display);
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--cyan);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sat-category-tabs {
      display: flex;
      gap: 0.35rem;
      padding: 0.55rem 0.85rem;
      background: rgba(0, 0, 0, 0.45);
      border-bottom: 1px solid rgba(0, 240, 255, 0.12);
      overflow-x: auto;
      white-space: nowrap;
    }

    .sat-tab,
    .sat-tab-btn {
      background: rgba(0, 240, 255, 0.06);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 4px;
      color: var(--text-muted);
      font-family: var(--font-display);
      font-size: 0.58rem;
      letter-spacing: 0.08em;
      padding: 0.3rem 0.6rem;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .sat-tab:hover,
    .sat-tab-btn:hover {
      border-color: var(--cyan);
      color: #fff;
    }

    .sat-tab.active,
    .sat-tab-btn.active {
      background: var(--cyan);
      color: #000;
      font-weight: 700;
      box-shadow: 0 0 12px var(--cyan-glow);
    }

    .sat-search-bar {
      padding: 0.5rem 0.85rem;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(0, 240, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sat-search-input {
      flex: 1;
      background: rgba(0, 10, 24, 0.8);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 4px;
      padding: 0.38rem 0.65rem;
      color: #fff;
      font-family: var(--font-code);
      font-size: 0.72rem;
      outline: none;
    }

    .sat-search-input:focus {
      border-color: var(--cyan);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
    }

    .sat-list-scroll {
      flex: 1;
      overflow-y: auto;
      max-height: 380px;
      padding: 0.65rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .sat-card {
      background: rgba(0, 240, 255, 0.04);
      border: 1px solid rgba(0, 240, 255, 0.14);
      border-radius: 8px;
      padding: 0.65rem 0.8rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      transition: all 0.15s ease-in-out;
    }

    .sat-card:hover {
      background: rgba(0, 240, 255, 0.1);
      border-color: var(--cyan);
      transform: translateX(4px);
    }

    .sat-card.active-sat {
      background: rgba(0, 240, 255, 0.2);
      border-color: var(--cyan);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
    }

    .sat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .sat-name-wrap {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-family: var(--font-display);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sat-cat-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .sat-card-badges {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex-shrink: 0;
    }

    .sat-badge-pill {
      font-family: var(--font-code);
      font-size: 0.58rem;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
    }

    .sat-card-metrics {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-code);
      font-size: 0.65rem;
      color: var(--text-muted);
      background: rgba(0, 0, 0, 0.35);
      padding: 0.3rem 0.5rem;
      border-radius: 4px;
    }

    .sat-card-actions {
      display: flex;
      gap: 0.35rem;
      margin-top: 0.15rem;
    }

    .sat-item-row {
      background: rgba(0, 240, 255, 0.04);
      border: 1px solid rgba(0, 240, 255, 0.14);
      border-radius: 6px;
      padding: 0.55rem 0.75rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.15s;
    }

    .sat-item-row:hover {
      background: rgba(0, 240, 255, 0.14);
      border-color: var(--cyan);
      transform: translateX(3px);
    }

    .sat-item-row.selected {
      background: rgba(0, 240, 255, 0.22);
      border-color: var(--cyan);
      box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
    }

    .sat-telemetry-box {
      border-top: 1px solid rgba(0, 240, 255, 0.25);
      background: rgba(0, 8, 20, 0.95);
      padding: 0.75rem 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .sat-hud-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.45rem;
    }

    .sat-hud-cell {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 240, 255, 0.15);
      border-radius: 4px;
      padding: 0.35rem 0.5rem;
    }

    .sat-hud-lbl {
      font-family: var(--font-display);
      font-size: 0.52rem;
      color: var(--text-muted);
      letter-spacing: 0.08em;
    }

    .sat-hud-val {
      font-family: var(--font-code);
      font-size: 0.72rem;
      font-weight: 700;
      color: #fff;
    }

    /* Chase Cam Floating HUD Banner */
    #chase-cam-banner {
      position: absolute;
      top: 75px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(2, 6, 16, 0.92);
      backdrop-filter: blur(14px);
      border: 1px solid var(--gold);
      border-radius: 8px;
      padding: 0.45rem 1.1rem;
      display: none;
      align-items: center;
      gap: 0.85rem;
      z-index: 110;
      box-shadow: 0 0 25px rgba(255, 183, 0, 0.35);
      animation: pulseGlow 2s infinite;
    }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(255, 183, 0, 0.3); }
      50% { box-shadow: 0 0 28px rgba(255, 183, 0, 0.6); }
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

  <!-- Chase Camera Active Cockpit HUD Banner -->
  <div id="chase-cam-banner" class="interactive">
    <span class="ticker-dot" style="background:var(--gold); box-shadow:0 0 8px var(--gold);"></span>
    <span style="font-family:var(--font-display); font-size:0.72rem; color:var(--gold); letter-spacing:0.12em;">CHASE CAM COCKPIT LOCK: <strong id="chase-cam-sat-name" style="color:#fff;">ISS (ZARYA)</strong></span>
    <button class="cam-btn cam-btn-orange" onclick="toggleChaseCam()" style="padding:0.2rem 0.55rem; font-size:0.6rem;">EXIT COCKPIT (ESC)</button>
  </div>

  <!-- Tactical HUD Layer -->
  <div class="hud-layer">
    <!-- Top Command Bar -->
    <header class="top-bar interactive">
      <div class="brand-section">
        <div class="brand-logo" onclick="toggleSatellitesDeck()" title="Orbital Reconnaissance Satellite // Click to inspect live satellites">
          <svg class="satellite-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="solarCellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#001428"/>
                <stop offset="45%" stop-color="#0052a3"/>
                <stop offset="85%" stop-color="#0099ff"/>
                <stop offset="100%" stop-color="#00f0ff"/>
              </linearGradient>
              <linearGradient id="solarFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2c3e50"/>
                <stop offset="50%" stop-color="#78909c"/>
                <stop offset="100%" stop-color="#cfd8dc"/>
              </linearGradient>
              <linearGradient id="goldTopGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ffa000"/>
                <stop offset="40%" stop-color="#ffd54f"/>
                <stop offset="80%" stop-color="#fff59d"/>
                <stop offset="100%" stop-color="#ffffff"/>
              </linearGradient>
              <linearGradient id="goldLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffb300"/>
                <stop offset="50%" stop-color="#ff8f00"/>
                <stop offset="100%" stop-color="#e65100"/>
              </linearGradient>
              <linearGradient id="goldRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e65100"/>
                <stop offset="60%" stop-color="#bf360c"/>
                <stop offset="100%" stop-color="#5d1a00"/>
              </linearGradient>
              <radialGradient id="dishGrad" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="40%" stop-color="#eceff1"/>
                <stop offset="75%" stop-color="#90a4ae"/>
                <stop offset="100%" stop-color="#37474f"/>
              </radialGradient>
              <radialGradient id="ionGlow" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#00f0ff" stop-opacity="1"/>
                <stop offset="40%" stop-color="#0088ff" stop-opacity="0.8"/>
                <stop offset="80%" stop-color="#002266" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
              </radialGradient>
              <filter id="thrusterFilter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- 1. Deep Space Orbital Trajectory Arc -->
            <path d="M 12,50 A 42,42 0 0,1 88,50" stroke="rgba(0,240,255,0.24)" stroke-width="1.2" stroke-dasharray="3,4" fill="none"/>
            <circle cx="88" cy="50" r="1.5" fill="rgba(0,240,255,0.7)"/>
            <circle cx="12" cy="50" r="1.5" fill="rgba(0,240,255,0.7)"/>

            <!-- 2. Ion Engine Thruster Exhaust Plume -->
            <g class="sat-thruster-plume" filter="url(#thrusterFilter)">
              <ellipse cx="43" cy="72" rx="4.5" ry="8" transform="rotate(22 43 72)" fill="url(#ionGlow)"/>
              <ellipse cx="43" cy="70" rx="2" ry="4" transform="rotate(22 43 70)" fill="#ffffff" opacity="0.9"/>
            </g>

            <!-- 3. Left Solar Array Wing -->
            <line x1="36" y1="48" x2="25" y2="42" stroke="url(#solarFrameGrad)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="36" cy="48" r="1.5" fill="#78909c"/>
            <circle cx="25" cy="42" r="1.8" fill="#cfd8dc"/>

            <polygon points="2,28 25,41.5 25,57.5 2,44" fill="#030b14" stroke="url(#solarFrameGrad)" stroke-width="1.2"/>
            <!-- Solar Cell Modules -->
            <polygon points="3.5,29.5 9.5,33 9.5,47 3.5,43.5" fill="url(#solarCellGrad)"/>
            <line x1="3.5" y1="36.5" x2="9.5" y2="40" stroke="#00f0ff" stroke-width="0.5" opacity="0.75"/>
            <polygon points="10.5,33.5 16.5,37 16.5,51 10.5,47.5" fill="url(#solarCellGrad)"/>
            <line x1="10.5" y1="40.5" x2="16.5" y2="44" stroke="#00f0ff" stroke-width="0.5" opacity="0.75"/>
            <polygon points="17.5,37.5 23.5,41 23.5,55 17.5,51.5" fill="url(#solarCellGrad)"/>
            <line x1="17.5" y1="44.5" x2="23.5" y2="48" stroke="#00f0ff" stroke-width="0.5" opacity="0.75"/>
            <line x1="3" y1="36.5" x2="24" y2="48.5" stroke="#ffffff" stroke-width="0.6" opacity="0.85"/>

            <!-- 4. Right Solar Array Wing -->
            <line x1="64" y1="50" x2="75" y2="56" stroke="url(#solarFrameGrad)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="64" cy="50" r="1.5" fill="#78909c"/>
            <circle cx="75" cy="56" r="1.8" fill="#cfd8dc"/>

            <polygon points="75,42.5 98,55.5 98,71.5 75,58.5" fill="#030b14" stroke="url(#solarFrameGrad)" stroke-width="1.2"/>
            <!-- Solar Cell Modules -->
            <polygon points="76.5,44 82.5,47.5 82.5,61.5 76.5,58" fill="url(#solarCellGrad)"/>
            <line x1="76.5" y1="51" x2="82.5" y2="54.5" stroke="#00f0ff" stroke-width="0.5" opacity="0.75"/>
            <polygon points="83.5,48 89.5,51.5 89.5,65.5 83.5,62" fill="url(#solarCellGrad)"/>
            <line x1="83.5" y1="55" x2="89.5" y2="58.5" stroke="#00f0ff" stroke-width="0.5" opacity="0.75"/>
            <polygon points="90.5,52 96.5,55.5 96.5,69.5 90.5,66" fill="url(#solarCellGrad)"/>
            <line x1="90.5" y1="59" x2="96.5" y2="62.5" stroke="#00f0ff" stroke-width="0.5" opacity="0.75"/>
            <line x1="76" y1="51" x2="97" y2="63" stroke="#ffffff" stroke-width="0.6" opacity="0.85"/>

            <!-- 5. High-Gain Parabolic Communications Dish -->
            <g transform="translate(68, 22)">
              <line x1="-10" y1="12" x2="0" y2="0" stroke="#90a4ae" stroke-width="1.5"/>
              <ellipse cx="0" cy="0" rx="11" ry="6.5" transform="rotate(-30)" fill="url(#dishGrad)" stroke="#b0bec5" stroke-width="1"/>
              <ellipse cx="0" cy="0" rx="8" ry="4.5" transform="rotate(-30)" fill="#37474f" opacity="0.45"/>
              <line x1="-3" y1="-5" x2="2" y2="-10" stroke="#00f0ff" stroke-width="0.7"/>
              <line x1="3" y1="5" x2="2" y2="-10" stroke="#00f0ff" stroke-width="0.7"/>
              <circle cx="2" cy="-10" r="1.5" fill="#00f0ff"/>
            </g>

            <!-- 6. Central Satellite Bus (Isometric Cube Body) -->
            <polygon points="41,63 46,66 43,70 38,67" fill="#263238" stroke="#455a64" stroke-width="0.8"/>
            <polygon points="36,41 50,49 50,67 36,59" fill="url(#goldLeftGrad)" stroke="#ffd54f" stroke-width="0.8"/>
            <polygon points="50,49 64,41 64,59 50,67" fill="url(#goldRightGrad)" stroke="#ffb300" stroke-width="0.8"/>
            <polygon points="50,33 64,41 50,49 36,41" fill="url(#goldTopGrad)" stroke="#fff59d" stroke-width="0.8"/>

            <!-- MLI Thermal Quilt Seams & Texture Grid on Top Face -->
            <line x1="43" y1="37" x2="57" y2="45" stroke="#ffe082" stroke-width="0.5" opacity="0.7"/>
            <line x1="57" y1="37" x2="43" y2="45" stroke="#ffe082" stroke-width="0.5" opacity="0.7"/>

            <!-- Optical Payload Camera / Reconnaissance Aperture on Left Face -->
            <circle cx="43" cy="53" r="3.6" fill="#030a16" stroke="#00f0ff" stroke-width="0.9"/>
            <circle cx="43" cy="53" r="2.2" fill="#002b4d"/>
            <ellipse cx="42" cy="52" rx="1.2" ry="0.7" fill="#ffffff" opacity="0.9"/>
            <line x1="40" y1="60" x2="46" y2="63.5" stroke="#ffe082" stroke-width="0.6"/>
            <line x1="40" y1="62" x2="46" y2="65.5" stroke="#ffe082" stroke-width="0.6"/>

            <!-- Radiator Louvers on Right Face -->
            <line x1="53" y1="52" x2="61" y2="47.5" stroke="#8d2600" stroke-width="0.8"/>
            <line x1="53" y1="56" x2="61" y2="51.5" stroke="#8d2600" stroke-width="0.8"/>
            <line x1="53" y1="60" x2="61" y2="55.5" stroke="#8d2600" stroke-width="0.8"/>

            <!-- 7. Forward Telemetry Antenna Mast & Active Strobe Beacon -->
            <line x1="50" y1="33" x2="50" y2="12" stroke="#00f0ff" stroke-width="1.4" stroke-linecap="round"/>
            <line x1="46" y1="18" x2="54" y2="18" stroke="#00f0ff" stroke-width="1"/>
            <line x1="47.5" y1="15" x2="52.5" y2="15" stroke="#00f0ff" stroke-width="0.8"/>

            <!-- Pulsing Strobe Beacon LED -->
            <circle cx="50" cy="11" r="5" fill="none" stroke="#00f0ff" stroke-width="1" class="sat-beacon-ring"/>
            <circle cx="50" cy="11" r="2.2" fill="#ffffff" class="sat-beacon" filter="url(#beaconGlow)"/>
          </svg>
        </div>
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
        <div class="tele-stat" style="cursor:pointer;" onclick="toggleSatellitesDeck()" title="Click to view live orbital satellites">
          <span class="tele-label" style="color:var(--cyan);">🛰️ ORBIT SATS</span>
          <span class="tele-val" id="hud-sat-count" style="color:var(--cyan);">--</span>
        </div>
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

    <!-- Live Satellite Orbit Tracking Command Net Modal -->
    <div id="satellites-modal" class="interactive">
      <div class="sat-header">
        <div class="sat-title">
          <span class="ticker-dot" style="background:var(--cyan); box-shadow:0 0 8px var(--cyan);"></span>
          <span>🛰️ LIVE SATELLITE ORBITS & TELEMETRY</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span id="sat-modal-count-badge" class="hud-badge" style="border-color:var(--cyan); color:var(--cyan);">0 IN ORBIT</span>
          <button class="close-card-btn" onclick="toggleSatellitesDeck()">✕</button>
        </div>
      </div>

      <!-- Constellation Filter Tabs -->
      <div class="sat-category-tabs">
        <button class="sat-tab active" data-cat="all" onclick="setSatelliteFilter('all')">ALL ORBITS</button>
        <button class="sat-tab" data-cat="stations" onclick="setSatelliteFilter('stations')">STATIONS (ISS/CSS)</button>
        <button class="sat-tab" data-cat="starlink" onclick="setSatelliteFilter('starlink')">STARLINK</button>
        <button class="sat-tab" data-cat="gps" onclick="setSatelliteFilter('gps')">GPS / NAVSTAR</button>
        <button class="sat-tab" data-cat="weather" onclick="setSatelliteFilter('weather')">WEATHER / NOAA</button>
        <button class="sat-tab" data-cat="science" onclick="setSatelliteFilter('science')">SCIENCE / HST</button>
      </div>

      <!-- Quick Search & Display Filters -->
      <div class="sat-search-bar">
        <span style="color:var(--cyan); font-size:0.8rem;">🔍</span>
        <input type="text" id="sat-search-input" class="sat-search-input" placeholder="Search satellite name, NORAD ID, operator..." oninput="filterSatellitesList()">
        <button id="btn-modal-sat-vis-toggle" class="sat-tab active" onclick="toggleSatellitesVisibility()" title="Hide or Unhide all 3D satellites in orbit">👁️ SATS: ON</button>
        <button id="btn-sat-orbits-toggle" class="sat-tab active" onclick="toggleAllOrbits()" title="Toggle orbital trajectory lines in 3D">🌐 ORBITS</button>
        <button id="btn-sat-labels-toggle" class="sat-tab" onclick="toggleSatelliteLabels()" title="Toggle billboard labels">🏷️ LABELS</button>
      </div>

      <!-- Live Satellites Scrollable List Container -->
      <div class="sat-list-scroll" id="satellites-list-body">
        <div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-family:var(--font-code); font-size:0.75rem;">
          Querying CelesTrak NORAD Ephemeris & Propagating SGP4 Orbits...
        </div>
      </div>
    </div>

    <!-- Bottom Controls & Event Ticker -->
    <div class="hud-bottom">
      <!-- Camera & Map Style Controls Bar -->
      <div class="camera-controls-bar interactive">
        <button class="cam-btn" id="btn-satellites-toggle" onclick="toggleSatellitesDeck()" style="border-color:rgba(0,240,255,0.45); color:var(--cyan);">
          <span>🛰️</span> SATELLITES (<span id="btn-sat-count">0</span>)
        </button>
        <button class="cam-btn active" id="btn-sats-hide-toggle" onclick="toggleSatellitesVisibility()" style="border-color:rgba(0,240,255,0.45); color:var(--cyan);" title="Hide / Unhide all 3D satellites in orbit">
          <span>🛰️</span> SATS: VISIBLE
        </button>
        <button class="cam-btn active" id="btn-orbits-toggle" onclick="toggleAllOrbits()" style="border-color:rgba(0,240,255,0.3); color:var(--text-main);">
          <span>⭕</span> ORBITS: ON
        </button>
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

    const satellitesGroup = new THREE.Group();
    globeGroup.add(satellitesGroup);

    const orbitsGroup = new THREE.Group();
    globeGroup.add(orbitsGroup);

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
    // LIVE SATELLITE ORBIT TRACKING ENGINE (NORAD SGP4 & 3D VISUALIZATION)
    // ═══════════════════════════════════════════════════════════════════
    let liveSatellites = [];
    let selectedSatellite = null;
    let chaseCamActive = false;
    let showAllSatellites = true;
    let showAllOrbits = true;
    let showSatLabels = false;
    let currentSatCategory = 'all';
    let satSearchQuery = '';

    // Selected satellite 3D accessories
    let satDetailedMesh = null;
    let activeOrbitLine = null;
    let activeGroundLaser = null;
    let activeFootprintRing = null;
    let lastSatPropTime = 0;
    let satStrobeTime = 0;

    const SAT_COLORS = {
      stations: '#ffd600', // Gold
      starlink: '#00f0ff', // Cyan
      gps: '#00e676',      // Neon Emerald
      weather: '#b388ff',  // Purple / Violet
      science: '#ff6d00',  // Solar Orange
      visual: '#00f0ff',
      all: '#00f0ff'
    };

    /**
     * Compute scaled 3D globe radius from real-world altitude in kilometers.
     * Prevents clipping into Earth/atmosphere while giving distinct LEO, MEO, and GEO layers.
     */
    function calculateSatelliteAltitudeRadius(altKm) {
      if (isNaN(altKm) || altKm < 100) altKm = 400;
      if (altKm <= 2000) {
        // LEO: 300km - 2,000km -> r: 63.8 to 74.0
        return GLOBE_RADIUS + 3.8 + (altKm / 2000) * 10.2;
      } else if (altKm <= 22000) {
        // MEO (GPS): 2,000km - 22,000km -> r: 74.0 to 100.0
        return GLOBE_RADIUS + 14.0 + ((altKm - 2000) / 20000) * 26.0;
      } else {
        // GEO: ~35,786km -> r: 100.0 to 125.0
        return GLOBE_RADIUS + 40.0 + (Math.min(altKm - 22000, 20000) / 20000) * 25.0;
      }
    }

    /**
     * Propagate satellite position and velocity vector at a specific UTC timestamp using SGP4.
     */
    function getSatelliteCoordinates(satrec, date = new Date()) {
      if (!satrec || typeof satellite === 'undefined' || !satellite.propagate) return null;
      try {
        const pv = satellite.propagate(satrec, date);
        if (!pv || !pv.position || isNaN(pv.position.x)) return null;

        const gmst = satellite.gstime(date);
        const gd = satellite.eciToGeodetic(pv.position, gmst);
        const lat = satellite.degreesLat(gd.latitude);
        const lon = satellite.degreesLong(gd.longitude);
        const alt = Math.max(100, gd.height); // in km

        let vel = 7.66;
        if (pv.velocity && !isNaN(pv.velocity.x)) {
          vel = Math.sqrt(pv.velocity.x * pv.velocity.x + pv.velocity.y * pv.velocity.y + pv.velocity.z * pv.velocity.z);
        }

        return { lat, lon, alt, vel };
      } catch (err) {
        return null;
      }
    }

    /**
     * Compute instantaneous 3D Vector3 inside globeGroup for given lat, lon, alt.
     */
    function calculateSatellite3DPosition(lat, lon, alt) {
      const r = calculateSatelliteAltitudeRadius(alt);
      return latLonToVector3(lat, lon, r);
    }

    // ─── Shared Realistic 3D Satellite Materials ───
    const SAT_MATERIALS = {
      busGold: new THREE.MeshStandardMaterial({ color: 0xdf9f1a, metalness: 0.85, roughness: 0.25, emissive: 0x221400 }),
      busWhite: new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.45, roughness: 0.35 }),
      busSilver: new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.88, roughness: 0.2 }),
      busDark: new THREE.MeshStandardMaterial({ color: 0x242830, metalness: 0.75, roughness: 0.45 }),
      solarBlue: new THREE.MeshStandardMaterial({ color: 0x0c3b88, metalness: 0.92, roughness: 0.18, emissive: 0x00163a }),
      solarGold: new THREE.MeshStandardMaterial({ color: 0xc68a12, metalness: 0.88, roughness: 0.22, emissive: 0x1f1200 }),
      truss: new THREE.MeshStandardMaterial({ color: 0x8899a6, metalness: 0.65, roughness: 0.4 }),
      dish: new THREE.MeshStandardMaterial({ color: 0xdde2e6, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide }),
      radiator: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.3, roughness: 0.6 }),
      ionGlow: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
      strobeRed: new THREE.MeshBasicMaterial({ color: 0xff1744 }),
      strobeGreen: new THREE.MeshBasicMaterial({ color: 0x00e676 }),
      strobeCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
      lensDark: new THREE.MeshStandardMaterial({ color: 0x050d18, metalness: 0.95, roughness: 0.1 }),
      cupolaWindow: new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 }),
      hitSphere: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    };

    /**
     * Builds authentic 3D model for Space Stations (ISS / Tiangong)
     * Features pressurized module spine, integrated truss structure, 8 massive solar wings, radiators, and cupola.
     */
    function buildStationArchitecture(mGroup, sat) {
      // 1. Central Pressurized Module Spine
      const spineGeo = new THREE.CylinderGeometry(0.55, 0.55, 3.4, 16);
      const spineMesh = new THREE.Mesh(spineGeo, SAT_MATERIALS.busWhite);
      spineMesh.rotation.x = Math.PI / 2;
      mGroup.add(spineMesh);

      // Transverse Node Module
      const nodeGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
      const nodeMesh = new THREE.Mesh(nodeGeo, SAT_MATERIALS.busSilver);
      nodeMesh.rotation.z = Math.PI / 2;
      mGroup.add(nodeMesh);

      // Docked Transport Capsule (Soyuz / Dragon)
      const capNose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.75, 12), SAT_MATERIALS.busWhite);
      capNose.position.set(0, 0, -2.1);
      capNose.rotation.x = -Math.PI / 2;
      mGroup.add(capNose);

      const capBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 12), SAT_MATERIALS.busDark);
      capBody.position.set(0, 0, -1.65);
      capBody.rotation.x = -Math.PI / 2;
      mGroup.add(capBody);

      // Earth-facing Cupola Observation Dome (pointing towards Earth along +Z)
      const cupolaMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), SAT_MATERIALS.cupolaWindow);
      cupolaMesh.position.set(0, 0, 0.55);
      mGroup.add(cupolaMesh);

      // 2. Integrated Truss Structure (ITS Cross-Beam)
      const trussGeo = new THREE.CylinderGeometry(0.12, 0.12, 11.4, 8);
      const trussMesh = new THREE.Mesh(trussGeo, SAT_MATERIALS.truss);
      trussMesh.rotation.z = Math.PI / 2;
      mGroup.add(trussMesh);

      // 3. Eight Massive Dual Solar Array Wings (4 Port, 4 Starboard)
      const wingGeo = new THREE.BoxGeometry(2.3, 0.04, 1.1);
      [-5.6, -4.3, 4.3, 5.6].forEach(x => {
        const wingFwd = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarGold);
        wingFwd.position.set(x, 0, 1.2);
        mGroup.add(wingFwd);

        const wingAft = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarBlue);
        wingAft.position.set(x, 0, -1.2);
        mGroup.add(wingAft);
      });

      // 4. Heat Rejection Radiators (White Thermal Vanes)
      const radGeo = new THREE.BoxGeometry(1.4, 0.04, 0.85);
      [-1.4, 0, 1.4].forEach(x => {
        const rad = new THREE.Mesh(radGeo, SAT_MATERIALS.radiator);
        rad.position.set(x, 0.75, 0);
        rad.rotation.z = Math.PI / 2;
        mGroup.add(rad);
      });

      // 5. Communications Dish
      const dishMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35), SAT_MATERIALS.dish);
      dishMesh.position.set(0, 0.8, 1.0);
      dishMesh.rotation.x = Math.PI;
      mGroup.add(dishMesh);

      // 6. Navigation Strobes
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), SAT_MATERIALS.strobeCyan);
      beacon.position.set(0, 1.1, 0);
      mGroup.add(beacon);
      mGroup.userData.beaconMesh = beacon;

      mGroup.scale.set(0.72, 0.72, 0.72);
    }

    /**
     * Builds authentic 3D model for SpaceX Starlink Satellites
     * Features low-profile flat-panel chassis, white phased-array bottom, single deployable solar array wing, and glowing ion thruster.
     */
    function buildStarlinkArchitecture(mGroup, sat) {
      // 1. Flat-Panel Chassis Bus
      const busMesh = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.22, 2.5), SAT_MATERIALS.busDark);
      mGroup.add(busMesh);

      // Earth-facing Phased Array Antenna Plate (Nadir +Z)
      const phaseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.04, 2.4), SAT_MATERIALS.busWhite);
      phaseMesh.position.set(0, 0, 0.12);
      mGroup.add(phaseMesh);

      // 2. Single Continuous Deployable Solar Array Wing (iconic single-wing Starlink design)
      const wingMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.04, 1.35), SAT_MATERIALS.solarBlue);
      wingMesh.position.set(-2.8, 0, 0);
      mGroup.add(wingMesh);

      // Wing Hinge Yoke
      const yokeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), SAT_MATERIALS.busSilver);
      yokeMesh.position.set(-0.85, 0, 0);
      yokeMesh.rotation.z = Math.PI / 2;
      mGroup.add(yokeMesh);

      // 3. Krypton / Argon Ion Propulsion Thruster
      const thrustBlock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.35), SAT_MATERIALS.busDark);
      thrustBlock.position.set(0, -1.32, 0);
      mGroup.add(thrustBlock);

      const ionNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.25, 12), SAT_MATERIALS.ionGlow);
      ionNozzle.position.set(0, -1.48, 0);
      ionNozzle.rotation.x = Math.PI / 2;
      mGroup.add(ionNozzle);

      // 4. Intersatellite Optical Laser Terminals (ISL)
      const laserTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8), SAT_MATERIALS.busSilver);
      laserTerm.position.set(0, 1.28, 0);
      mGroup.add(laserTerm);

      // Strobe beacon
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), SAT_MATERIALS.strobeCyan);
      beacon.position.set(0, 0, -0.2);
      mGroup.add(beacon);
      mGroup.userData.beaconMesh = beacon;

      mGroup.scale.set(0.68, 0.68, 0.68);
    }

    /**
     * Builds authentic 3D model for GPS / Navstar / Navigation Satellites
     * Features golden MLI bus, dual articulated solar array wings, and signature Earth-facing helical navigation antenna cluster.
     */
    function buildGpsArchitecture(mGroup, sat) {
      // 1. Golden MLI-wrapped Satellite Bus
      const busMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.8), SAT_MATERIALS.busGold);
      mGroup.add(busMesh);

      // Thermal Radiator Panels on bus sides
      [-0.82, 0.82].forEach(x => {
        const rad = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 1.4), SAT_MATERIALS.busSilver);
        rad.position.set(x, 0, 0);
        mGroup.add(rad);
      });

      // 2. Dual Articulated Solar Array Wings
      const wingGeo = new THREE.BoxGeometry(3.6, 0.06, 1.25);
      const leftWing = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarBlue);
      leftWing.position.set(-2.7, 0, 0);
      mGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarBlue);
      rightWing.position.set(2.7, 0, 0);
      mGroup.add(rightWing);

      // Truss Booms
      const boomGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      [-1.1, 1.1].forEach(x => {
        const boom = new THREE.Mesh(boomGeo, SAT_MATERIALS.truss);
        boom.position.set(x, 0, 0);
        boom.rotation.z = Math.PI / 2;
        mGroup.add(boom);
      });

      // 3. Signature Earth-Facing L-Band Helical Navigation Antenna Array Cluster
      const deckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 16), SAT_MATERIALS.busSilver);
      deckMesh.position.set(0, 0, 0.95);
      deckMesh.rotation.x = Math.PI / 2;
      mGroup.add(deckMesh);

      // Conical Helical Antennas pointing towards Earth (+Z)
      const hornGeo = new THREE.ConeGeometry(0.14, 0.52, 8);
      const centerHorn = new THREE.Mesh(hornGeo, SAT_MATERIALS.busGold);
      centerHorn.position.set(0, 0, 1.24);
      centerHorn.rotation.x = Math.PI / 2;
      mGroup.add(centerHorn);

      [[-0.34, -0.34], [-0.34, 0.34], [0.34, -0.34], [0.34, 0.34]].forEach(([hx, hy]) => {
        const horn = new THREE.Mesh(hornGeo, SAT_MATERIALS.busGold);
        horn.position.set(hx, hy, 1.2);
        horn.rotation.x = Math.PI / 2;
        mGroup.add(horn);
      });

      // 4. Apogee Kick Engine Nozzle (Zenith -Z)
      const rocketNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.38, 0.45, 12), SAT_MATERIALS.busDark);
      rocketNozzle.position.set(0, 0, -1.05);
      rocketNozzle.rotation.x = -Math.PI / 2;
      mGroup.add(rocketNozzle);

      // Strobe beacon
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), SAT_MATERIALS.strobeGreen);
      beacon.position.set(0, 0.9, 0);
      mGroup.add(beacon);
      mGroup.userData.beaconMesh = beacon;

      mGroup.scale.set(0.7, 0.7, 0.7);
    }

    /**
     * Builds authentic 3D model for Weather & Earth Observation Satellites (GOES / NOAA / Meteosat)
     * Features asymmetric bus, Earth-facing scanning radiometer drum, single giant solar wing, and counterbalance boom.
     */
    function buildWeatherArchitecture(mGroup, sat) {
      // 1. Asymmetric Equipment Bus
      const busMesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.5, 2.0), SAT_MATERIALS.busGold);
      mGroup.add(busMesh);

      // 2. Earth-Viewing Scanning Radiometer / Sounder Drum (+Z)
      const drumMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.7, 16), SAT_MATERIALS.busSilver);
      drumMesh.position.set(0, 0, 1.15);
      drumMesh.rotation.x = Math.PI / 2;
      mGroup.add(drumMesh);

      const lensMesh = new THREE.Mesh(new THREE.CircleGeometry(0.52, 16), SAT_MATERIALS.lensDark);
      lensMesh.position.set(0, 0, 1.51);
      mGroup.add(lensMesh);

      // 3. Asymmetric Single Giant Solar Array Wing (Starboard +X)
      const wingMesh = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.06, 1.45), SAT_MATERIALS.solarBlue);
      wingMesh.position.set(2.8, 0, 0);
      mGroup.add(wingMesh);

      // 4. Solar Radiation Pressure Counterbalance Boom (Port -X)
      const mastMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 8), SAT_MATERIALS.truss);
      mastMesh.position.set(-2.1, 0, 0);
      mastMesh.rotation.z = Math.PI / 2;
      mGroup.add(mastMesh);

      const sailTip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 8), SAT_MATERIALS.busGold);
      sailTip.position.set(-3.9, 0, 0);
      sailTip.rotation.z = Math.PI / 2;
      mGroup.add(sailTip);

      // 5. High-Gain Weather Telemetry Downlink Dish
      const dishMesh = new THREE.Mesh(new THREE.SphereGeometry(0.68, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.38), SAT_MATERIALS.dish);
      dishMesh.position.set(0, 0.9, 0.6);
      dishMesh.rotation.x = Math.PI;
      mGroup.add(dishMesh);

      // Strobe beacon
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), SAT_MATERIALS.strobeCyan);
      beacon.position.set(0, 0.9, -0.7);
      mGroup.add(beacon);
      mGroup.userData.beaconMesh = beacon;

      mGroup.scale.set(0.7, 0.7, 0.7);
    }

    /**
     * Builds authentic 3D model for Science & Space Telescopes (Hubble HST / Kepler / Fermi)
     * Features optical telescope assembly tube, open sunshield aperture hood, gold aft module, and dual solar wings.
     */
    function buildScienceArchitecture(mGroup, sat) {
      // 1. Forward Optical Telescope Barrel Tube
      const barrelMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 3.2, 20), SAT_MATERIALS.busSilver);
      barrelMesh.position.set(0, 0, -0.6);
      barrelMesh.rotation.x = Math.PI / 2;
      mGroup.add(barrelMesh);

      // Open Aperture Sunshade Door (Angled Open at deep-space end)
      const doorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.6, 16, 1, true, 0, Math.PI), SAT_MATERIALS.busSilver);
      doorMesh.position.set(0, 0.3, -2.2);
      doorMesh.rotation.x = Math.PI / 2 + 0.35;
      mGroup.add(doorMesh);

      // Dark Interior Optical Baffle
      const baffleMesh = new THREE.Mesh(new THREE.CircleGeometry(0.72, 16), SAT_MATERIALS.lensDark);
      baffleMesh.position.set(0, 0, -2.18);
      mGroup.add(baffleMesh);

      // 2. Gold-Foil Aft Equipment Section (Service Systems & Electronics)
      const aftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12), SAT_MATERIALS.busGold);
      aftMesh.position.set(0, 0, 1.2);
      aftMesh.rotation.x = Math.PI / 2;
      mGroup.add(aftMesh);

      // 3. Dual Bi-Stem Flexible Solar Array Wings
      const wingGeo = new THREE.BoxGeometry(3.2, 0.05, 1.1);
      const leftWing = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarGold);
      leftWing.position.set(-2.5, 0, 0.3);
      mGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarGold);
      rightWing.position.set(2.5, 0, 0.3);
      mGroup.add(rightWing);

      // 4. Steerable High-Gain Communication Dishes
      [-0.9, 0.9].forEach(x => {
        const dish = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35), SAT_MATERIALS.dish);
        dish.position.set(x, 0.7, 1.1);
        dish.rotation.x = Math.PI;
        mGroup.add(dish);
      });

      // Strobe beacon
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), SAT_MATERIALS.strobeCyan);
      beacon.position.set(0, 1.0, 1.2);
      mGroup.add(beacon);
      mGroup.userData.beaconMesh = beacon;

      mGroup.scale.set(0.72, 0.72, 0.72);
    }

    /**
     * Builds authentic 3D model for Communications & Bright Visual Satellites (Iridium / O3b / Intelsat)
     * Features golden bus, dual multi-panel solar wings, and twin parabolic dishes.
     */
    function buildVisualArchitecture(mGroup, sat) {
      // 1. Spacecraft Bus (Gold Foil)
      const busMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 1.8), SAT_MATERIALS.busGold);
      mGroup.add(busMesh);

      // 2. Dual Multi-Panel Solar Wings
      const wingGeo = new THREE.BoxGeometry(3.6, 0.06, 1.2);
      const leftWing = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarBlue);
      leftWing.position.set(-2.7, 0, 0);
      mGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, SAT_MATERIALS.solarBlue);
      rightWing.position.set(2.7, 0, 0);
      mGroup.add(rightWing);

      // Booms
      const boomGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      [-1.1, 1.1].forEach(x => {
        const boom = new THREE.Mesh(boomGeo, SAT_MATERIALS.truss);
        boom.position.set(x, 0, 0);
        boom.rotation.z = Math.PI / 2;
        mGroup.add(boom);
      });

      // 3. Twin Parabolic Telecommunications Dishes
      const dishGeo = new THREE.SphereGeometry(0.62, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35);
      const dishLeft = new THREE.Mesh(dishGeo, SAT_MATERIALS.dish);
      dishLeft.position.set(-0.45, 0.82, 0.6);
      dishLeft.rotation.x = Math.PI;
      mGroup.add(dishLeft);

      const dishRight = new THREE.Mesh(dishGeo, SAT_MATERIALS.dish);
      dishRight.position.set(0.45, 0.82, 0.6);
      dishRight.rotation.x = Math.PI;
      mGroup.add(dishRight);

      // Strobe beacon
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), SAT_MATERIALS.strobeCyan);
      beacon.position.set(0, 0.95, -0.6);
      mGroup.add(beacon);
      mGroup.userData.beaconMesh = beacon;

      mGroup.scale.set(0.68, 0.68, 0.68);
    }

    /**
     * Procedural Dispatcher: attaches category-specific 3D satellite architecture to a group.
     */
    function createSatelliteArchitectureModel(group, sat) {
      const cat = sat.category || 'visual';
      if (cat === 'stations') {
        buildStationArchitecture(group, sat);
      } else if (cat === 'starlink') {
        buildStarlinkArchitecture(group, sat);
      } else if (cat === 'gps') {
        buildGpsArchitecture(group, sat);
      } else if (cat === 'weather') {
        buildWeatherArchitecture(group, sat);
      } else if (cat === 'science') {
        buildScienceArchitecture(group, sat);
      } else {
        buildVisualArchitecture(group, sat);
      }
    }

    /**
     * Holographic 3D Targeting Reticle for the Selected Satellite.
     */
    function createSatelliteTargetReticle(category = 'stations') {
      const group = new THREE.Group();
      const colHex = SAT_COLORS[category] || '#00f0ff';
      const col = new THREE.Color(colHex);

      // Outer wireframe octagonal reticle ring
      const outerGeo = new THREE.RingGeometry(3.1, 3.25, 8);
      const outerMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      group.add(outerMesh);

      // Inner high-precision targeting dashed ring
      const innerGeo = new THREE.RingGeometry(2.3, 2.42, 32);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      group.add(innerMesh);

      // Four corner HUD bracket ticks
      const bracketGeo = new THREE.BoxGeometry(0.12, 0.7, 0.02);
      const bracketMat = new THREE.MeshBasicMaterial({ color: col });
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const tick = new THREE.Mesh(bracketGeo, bracketMat);
        tick.position.set(Math.cos(angle) * 3.6, Math.sin(angle) * 3.6, 0);
        tick.rotation.z = angle;
        group.add(tick);
      }

      group.userData = { outerMesh, innerMesh };
      return group;
    }

    /**
     * Backwards-compatible alias for detailed mesh / targeting reticle.
     */
    function createDetailedSatelliteMesh(category = 'stations') {
      return createSatelliteTargetReticle(category);
    }

    /**
     * Creates an authentic 3D satellite spacecraft node in orbit around the globe.
     */
    function createSatelliteMarkerMesh(sat) {
      const group = new THREE.Group();

      // 1. Build authentic 3D satellite architecture model for its constellation/category
      createSatelliteArchitectureModel(group, sat);

      // 2. Invisible hit sphere for effortless raycasting click & hover detection
      const hitGeo = new THREE.SphereGeometry(2.5, 8, 8);
      const hitMesh = new THREE.Mesh(hitGeo, SAT_MATERIALS.hitSphere);
      group.add(hitMesh);

      // 3. Billboard Text Label (if toggled)
      const colorHex = SAT_COLORS[sat.category] || SAT_COLORS.visual;
      const labelSprite = makeTextSprite(sat.name, colorHex);
      labelSprite.position.set(0, 3.2, 0);
      labelSprite.scale.set(11, 2.5, 1);
      labelSprite.visible = showSatLabels;
      group.add(labelSprite);
      group.userData.labelSprite = labelSprite;

      // 4. Attach data pointer for raycaster
      group.userData.satData = sat;
      sat.markerGroup = group;

      return group;
    }

    /**
     * Traces the full 3D orbital trajectory path of a satellite over one revolution period.
     */
    function createOrbitTrajectoryLine(satrec, periodMin = 95, colorHex = '#00f0ff', opacity = 0.28, numSteps = 72) {
      if (!satrec || typeof satellite === 'undefined') return null;
      const points = [];
      const now = new Date();
      const halfPeriodMs = (periodMin * 60 * 1000) / 2;
      const stepMs = (periodMin * 60 * 1000) / numSteps;

      for (let i = 0; i <= numSteps; i++) {
        const sampleTime = new Date(now.getTime() - halfPeriodMs + i * stepMs);
        const coords = getSatelliteCoordinates(satrec, sampleTime);
        if (coords) {
          points.push(calculateSatellite3DPosition(coords.lat, coords.lon, coords.alt));
        }
      }

      if (points.length < 4) return null;

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: opacity,
        linewidth: 1
      });
      return new THREE.Line(geo, mat);
    }

    /**
     * Initializes and fetches live satellites from the Switcher Relay backend API.
     */
    async function loadLiveSatellites(group = 'all', forceRefresh = false) {
      currentSatCategory = group;
      const modalBadge = document.getElementById('sat-modal-count-badge');
      const btnCount = document.getElementById('btn-sat-count');
      const hudSatCount = document.getElementById('hud-sat-count');

      if (modalBadge) modalBadge.innerText = 'FETCHING CELESTRAK...';

      try {
        const url = \`/api/satellites?group=\${encodeURIComponent(group)}\${forceRefresh ? '&refresh=1' : ''}\`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data = await res.json();

        if (data.satellites && Array.isArray(data.satellites)) {
          buildSatellitesScene(data.satellites);
          addTickerEvent(\`[SATELLITE] CELESTRAK EPHEMERIS LOADED: \${data.satellites.length} ORBITING OBJECTS\`);
        }
      } catch (err) {
        console.warn('[SATELLITE] Error loading live satellites:', err);
        if (modalBadge) modalBadge.innerText = 'OFFLINE CATALOG';
        // Fallback local initial load
        if (liveSatellites.length === 0) {
          fetchFallbackSatellites();
        }
      }
    }

    /**
     * Fallback loader if network fetch fails.
     */
    function fetchFallbackSatellites() {
      const fallbackList = [
        { name: "ISS (ZARYA)", id: "25544", line1: "1 25544U 98067A   26249.49984954  .00015694  00000+0  28373-3 0  9990", line2: "2 25544  51.6416 117.8423 0006248  91.3644 268.8718 15.49842475583627", category: "stations", operator: "NASA / Roscosmos", orbitType: "LEO" },
        { name: "CSS (TIANGONG)", id: "48274", line1: "1 48274U 21035A   26249.52847222  .00018500  00000+0  21000-3 0  9998", line2: "2 48274  41.4720 180.2500 0005500 120.4500 240.1200 15.62000000210005", category: "stations", operator: "CNSA (China)", orbitType: "LEO" },
        { name: "HST (HUBBLE)", id: "20580", line1: "1 20580U 90037B   26249.20000000  .00001500  00000+0  50000-4 0  9991", line2: "2 20580  28.4690 150.1200 0002800 250.0000 110.0000 15.08000000180002", category: "science", operator: "NASA / ESA", orbitType: "LEO" },
        { name: "GPS BIIF-1 (PRN 25)", id: "36585", line1: "1 36585U 10022A   26249.10000000  .00000000  00000+0  00000+0 0  9998", line2: "2 36585  55.2000  32.0000 0021000  65.0000 295.0000  2.00560000110007", category: "gps", operator: "US Space Force", orbitType: "MEO" },
        { name: "STARLINK-31652", id: "58921", line1: "1 58921U 24021A   26249.48000000  .00003000  00000+0  18000-3 0  9990", line2: "2 58921  43.0000 210.0000 0001800 115.0000 245.0000 15.12000000090007", category: "starlink", operator: "SpaceX", orbitType: "LEO" }
      ];
      buildSatellitesScene(fallbackList);
    }

    /**
     * Builds Three.js 3D markers and orbital lines for all loaded satellites.
     */
    function buildSatellitesScene(satList) {
      // Clear previous 3D satellite objects
      while (satellitesGroup.children.length > 0) satellitesGroup.remove(satellitesGroup.children[0]);
      while (orbitsGroup.children.length > 0) orbitsGroup.remove(orbitsGroup.children[0]);

      liveSatellites = [];
      const now = new Date();

      for (const s of satList) {
        if (!s.line1 || !s.line2) continue;

        let satrec = null;
        if (typeof satellite !== 'undefined' && satellite.twoline2satrec) {
          try {
            satrec = satellite.twoline2satrec(s.line1, s.line2);
          } catch (e) {}
        }

        // Calculate period in minutes from mean motion (revs/day in line 2 chars 52-63)
        let periodMin = 95;
        let incDeg = 51.6;
        try {
          const mm = parseFloat(s.line2.slice(52, 63));
          if (!isNaN(mm) && mm > 0) periodMin = 1440 / mm;
          const inc = parseFloat(s.line2.slice(8, 16));
          if (!isNaN(inc)) incDeg = inc;
        } catch (e) {}

        const satObj = {
          id: s.id,
          name: s.name,
          line1: s.line1,
          line2: s.line2,
          category: s.category || 'visual',
          operator: s.operator || 'International',
          orbitType: s.orbitType || (periodMin > 700 ? 'GEO' : (periodMin > 200 ? 'MEO' : 'LEO')),
          satrec: satrec,
          period: periodMin,
          inclination: incDeg,
          coords: null,
          markerGroup: null,
          orbitLineMesh: null
        };

        // Initial coordinates
        const coords = getSatelliteCoordinates(satrec, now);
        if (coords) {
          satObj.coords = coords;
          const marker = createSatelliteMarkerMesh(satObj);
          const pos = calculateSatellite3DPosition(coords.lat, coords.lon, coords.alt);
          marker.position.copy(pos);
          marker.lookAt(0, 0, 0);
          satellitesGroup.add(marker);

          // Add faint background orbit line for key / station / visual satellites
          if (showAllOrbits && (satObj.category === 'stations' || satObj.category === 'gps' || liveSatellites.length < 50)) {
            const orbitLine = createOrbitTrajectoryLine(satrec, periodMin, SAT_COLORS[satObj.category], 0.16);
            if (orbitLine) {
              orbitsGroup.add(orbitLine);
              satObj.orbitLineMesh = orbitLine;
            }
          }

          liveSatellites.push(satObj);
        }
      }

      // Update counters
      const countStr = liveSatellites.length.toString();
      const modalBadge = document.getElementById('sat-modal-count-badge');
      const btnCount = document.getElementById('btn-sat-count');
      const hudSatCount = document.getElementById('hud-sat-count');

      if (modalBadge) modalBadge.innerText = countStr + ' IN ORBIT';
      if (btnCount) btnCount.innerText = countStr;
      if (hudSatCount) hudSatCount.innerText = countStr + ' LIVE';

      renderSatellitesListHtml();
    }

    /**
     * Renders the satellite cards list inside the #satellites-list-body container.
     */
    function renderSatellitesListHtml() {
      const container = document.getElementById('satellites-list-body');
      if (!container) return;

      const q = satSearchQuery.trim().toUpperCase();
      const filtered = liveSatellites.filter(s => {
        const matchesCat = (currentSatCategory === 'all' || s.category === currentSatCategory);
        const matchesQuery = !q || s.name.toUpperCase().includes(q) || s.id.includes(q) || s.operator.toUpperCase().includes(q);
        return matchesCat && matchesQuery;
      });

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div style="text-align:center; padding:2rem; color:var(--text-muted); font-family:var(--font-code);">
            No satellites found matching "\${satSearchQuery}".
          </div>
        \`;
        return;
      }

      let html = '';
      for (const s of filtered) {
        const col = SAT_COLORS[s.category] || '#00f0ff';
        const isSelected = selectedSatellite?.id === s.id;
        const altStr = s.coords ? \`\${s.coords.alt.toFixed(0)} km\` : '--';
        const velStr = s.coords ? \`\${s.coords.vel.toFixed(2)} km/s\` : '7.66 km/s';

        html += \`
          <div class="sat-card \${isSelected ? 'active-sat' : ''}" onclick="selectSatelliteById('\${s.id}')">
            <div class="sat-card-header">
              <div class="sat-name-wrap" style="color:\${isSelected ? '#ffffff' : col};">
                <span class="sat-cat-dot" style="background:\${col}; box-shadow:0 0 8px \${col};"></span>
                <span>\${s.name}</span>
              </div>
              <div class="sat-card-badges">
                <span class="sat-badge-pill" style="border:1px solid \${col}; color:\${col};">#\${s.id}</span>
                <span class="sat-badge-pill">\${s.orbitType}</span>
              </div>
            </div>
            <div class="sat-card-metrics">
              <span>ALT: <strong style="color:#ffffff;">\${altStr}</strong></span>
              <span>VEL: <strong style="color:var(--gold);">\${velStr}</strong></span>
              <span>INC: <strong>\${s.inclination.toFixed(1)}°</strong></span>
            </div>
            <div class="sat-card-actions" onclick="event.stopPropagation();">
              <button class="btn-action" onclick="selectSatelliteById('\${s.id}')" style="padding:0.22rem 0.5rem; font-size:0.62rem;">🎯 FOCUS</button>
              <button class="btn-action" onclick="selectSatelliteById('\${s.id}'); toggleChaseCam(true);" style="padding:0.22rem 0.5rem; font-size:0.62rem; border-color:var(--magenta); color:var(--magenta);">🚀 CHASE</button>
              <a href="https://earth.google.com/web/@\${s.coords?.lat || 0},\${s.coords?.lon || 0},5000a,35y,0h,45t,0r" target="_blank" class="btn-action" style="padding:0.22rem 0.5rem; font-size:0.62rem; border-color:var(--gold); color:var(--gold);">🌍 GOOGLE EARTH</a>
            </div>
          </div>
        \`;
      }

      container.innerHTML = html;
    }

    /**
     * Selects and focuses a satellite by NORAD ID.
     */
    function selectSatelliteById(id) {
      const sat = liveSatellites.find(s => s.id === id);
      if (sat) selectSatellite(sat);
    }

    /**
     * Selects, highlights, and inspects a satellite object.
     */
    function selectSatellite(sat) {
      if (!sat) return;
      if (!showAllSatellites) toggleSatellitesVisibility(true);
      selectedSatellite = sat;
      selectedNode = null; // Unfocus network node

      playSelectSound();
      addTickerEvent(\`[ORBIT_LOCK] TARGET ACQUIRED: \${sat.name} // NORAD: #\${sat.id} [ALT: \${sat.coords?.alt?.toFixed(1) || 400} KM]\`);

      // Update 3D detailed model
      if (satDetailedMesh) globeGroup.remove(satDetailedMesh);
      satDetailedMesh = createDetailedSatelliteMesh(sat.category);
      if (sat.coords) {
        satDetailedMesh.position.copy(calculateSatellite3DPosition(sat.coords.lat, sat.coords.lon, sat.coords.alt));
        satDetailedMesh.lookAt(0, 0, 0);
      }
      globeGroup.add(satDetailedMesh);

      // Update active 3D orbit trajectory line
      if (activeOrbitLine) globeGroup.remove(activeOrbitLine);
      activeOrbitLine = createOrbitTrajectoryLine(sat.satrec, sat.period, '#00f0ff', 0.95, 90);
      if (activeOrbitLine) globeGroup.add(activeOrbitLine);

      // Update Sub-Satellite Ground Projection Laser and Footprint
      updateSatelliteGroundProjections(sat);

      // Update Camera Focus
      if (!chaseCamActive && sat.coords) {
        const phi = (sat.coords.lon + 180) * (Math.PI / 180);
        const theta = (90 - sat.coords.lat) * (Math.PI / 180);
        targetRotationY = (sat.coords.lon * Math.PI) / 180;
        targetRotationX = ((sat.coords.lat - 15) * Math.PI) / 180;
        targetCamPos = new THREE.Vector3(0, 20, 135);
      }

      // Populate Right Inspector Panel
      inspectSatellite(sat);

      // Update Chase Cam Banner if already active
      if (chaseCamActive) {
        const nameEl = document.getElementById('chase-sat-name') || document.getElementById('chase-cam-sat-name');
        if (nameEl) nameEl.innerText = sat.name;
        const speedEl = document.getElementById('chase-sat-speed');
        if (speedEl) speedEl.innerText = (sat.coords?.vel || 7.66).toFixed(2) + ' km/s';
      }

      // Show Chase Cam Button
      const chaseBtn = document.getElementById('btn-chase-cam');
      if (chaseBtn) chaseBtn.style.display = 'inline-flex';

      renderSatellitesListHtml();
    }

    /**
     * Updates Sub-Satellite ground projection laser and coverage footprint circle.
     */
    function updateSatelliteGroundProjections(sat) {
      if (!sat || !sat.coords) return;

      const satPos = calculateSatellite3DPosition(sat.coords.lat, sat.coords.lon, sat.coords.alt);
      const groundPos = latLonToVector3(sat.coords.lat, sat.coords.lon, GLOBE_RADIUS * 1.002);

      // 1. Projection Laser Line
      if (activeGroundLaser) globeGroup.remove(activeGroundLaser);
      const laserGeo = new THREE.BufferGeometry().setFromPoints([satPos, groundPos]);
      const laserMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(0x00f0ff),
        transparent: true,
        opacity: 0.65
      });
      activeGroundLaser = new THREE.Line(laserGeo, laserMat);
      globeGroup.add(activeGroundLaser);

      // 2. Communication Horizon Footprint Ring on Earth surface
      if (activeFootprintRing) globeGroup.remove(activeFootprintRing);
      const footRadius = Math.min(18, Math.max(3.5, Math.sqrt(sat.coords.alt) * 0.45));
      const ringGeo = new THREE.RingGeometry(footRadius - 0.25, footRadius + 0.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      activeFootprintRing = new THREE.Mesh(ringGeo, ringMat);
      activeFootprintRing.position.copy(groundPos);
      activeFootprintRing.lookAt(0, 0, 0);
      globeGroup.add(activeFootprintRing);
    }

    /**
     * Populates the Right Inspector Panel with comprehensive real-time orbital reconnaissance telemetry.
     */
    function inspectSatellite(sat) {
      if (!sat) return;
      const col = SAT_COLORS[sat.category] || 'var(--cyan)';

      document.getElementById('insp-name').innerText = '🛰️ ' + sat.name;
      document.getElementById('insp-name').style.color = col;

      const badge = document.getElementById('inspector-badge');
      badge.innerText = 'ORBIT ' + sat.orbitType;
      badge.style.borderColor = col;
      badge.style.color = col;

      const portBadge = document.getElementById('insp-port-badge');
      const portState = document.getElementById('insp-port-state');
      if (portBadge && portState) {
        portBadge.innerText = \`● NORAD CAT: #\${sat.id} [\${sat.category.toUpperCase()}]\`;
        portBadge.style.color = col;
        portState.innerText = 'ORBITING';
        portState.style.color = col;
        portState.style.borderColor = col;
      }

      document.getElementById('insp-ip').innerText = sat.operator || 'International Space Agency';
      
      const latStr = sat.coords ? \`\${Math.abs(sat.coords.lat).toFixed(2)}° \${sat.coords.lat >= 0 ? 'N' : 'S'}\` : '--';
      const lonStr = sat.coords ? \`\${Math.abs(sat.coords.lon).toFixed(2)}° \${sat.coords.lon >= 0 ? 'E' : 'W'}\` : '--';
      document.getElementById('insp-geo').innerText = \`Sub-Satellite Point: \${latStr}, \${lonStr}\`;

      const altKm = sat.coords?.alt || 400;
      const altMi = altKm * 0.621371;
      const velKms = sat.coords?.vel || 7.66;
      const velKmh = velKms * 3600;
      const velMph = velKmh * 0.621371;

      document.getElementById('insp-coords').innerText = \`Alt: \${altKm.toFixed(1)} km (\${altMi.toFixed(0)} mi) | Speed: \${velKms.toFixed(2)} km/s\`;
      document.getElementById('insp-route').innerText = \`Velocity: \${velKmh.toFixed(0)} km/h (\${velMph.toFixed(0)} mph) | Inc: \${sat.inclination.toFixed(1)}°\`;
      document.getElementById('insp-isp').innerText = \`Period: ~\${sat.period.toFixed(1)} min per revolution (\${(1440 / sat.period).toFixed(1)} orbits/day)\`;

      // Update Top Physical Address bar to show satellite sub-point safely
      const topAddr = document.getElementById('top-address-text');
      if (topAddr) topAddr.innerText = \`🛰️ \${sat.name} [ALT: \${altKm.toFixed(0)} KM | LAT: \${latStr}, LON: \${lonStr}]\`;
      const cardAddr = document.getElementById('card-full-address');
      if (cardAddr) cardAddr.innerText = \`🛰️ OVERFLIGHT: \${sat.name} (\${sat.operator}) // ALTITUDE: \${altKm.toFixed(1)} KM\`;
      const cardCoords = document.getElementById('card-coords');
      if (cardCoords) cardCoords.innerText = \`\${latStr}, \${lonStr}\`;
      const cardIsp = document.getElementById('card-isp');
      if (cardIsp) cardIsp.innerText = sat.operator || 'Space Agency';
      const gearthLink = document.getElementById('card-gearth-link');
      if (gearthLink) gearthLink.href = \`https://earth.google.com/web/@\${sat.coords?.lat || 0},\${sat.coords?.lon || 0},5000a,35y,0h,45t,0r\`;

      const inspCloseBtn = document.getElementById('insp-close-btn');
      if (inspCloseBtn) {
        inspCloseBtn.style.display = 'block';
        inspCloseBtn.innerText = '✕ DESELECT SATELLITE';
        inspCloseBtn.onclick = deselectSatellite;
      }
    }

    /**
     * Deselects the current satellite and returns to overview.
     */
    function deselectSatellite() {
      selectedSatellite = null;
      toggleChaseCam(false);
      if (satDetailedMesh) { globeGroup.remove(satDetailedMesh); satDetailedMesh = null; }
      if (activeOrbitLine) { globeGroup.remove(activeOrbitLine); activeOrbitLine = null; }
      if (activeGroundLaser) { globeGroup.remove(activeGroundLaser); activeGroundLaser = null; }
      if (activeFootprintRing) { globeGroup.remove(activeFootprintRing); activeFootprintRing = null; }

      const chaseBtn = document.getElementById('btn-chase-cam');
      if (chaseBtn) chaseBtn.style.display = 'none';

      focusMainSystem();
      renderSatellitesListHtml();
    }

    /**
     * Toggles Chase Cam Mode (locks camera right behind the satellite in orbit).
     */
    function toggleChaseCam(forceState) {
      if (forceState !== undefined) {
        chaseCamActive = forceState;
      } else {
        chaseCamActive = !chaseCamActive;
      }

      const banner = document.getElementById('chase-cam-banner');
      const btn = document.getElementById('btn-chase-cam');

      if (chaseCamActive && selectedSatellite) {
        banner.style.display = 'flex';
        const nameEl = document.getElementById('chase-sat-name') || document.getElementById('chase-cam-sat-name');
        if (nameEl) nameEl.innerText = selectedSatellite.name;
        const speedEl = document.getElementById('chase-sat-speed');
        if (speedEl) speedEl.innerText = (selectedSatellite.coords?.vel || 7.66).toFixed(2) + ' km/s';
        if (btn) {
          btn.classList.add('active');
          btn.innerHTML = '<span>🚀</span> CHASE CAM: ON';
        }
        playSelectSound();
        addTickerEvent(\`[CHASE_CAM] COCKPIT ORBIT VIEW ENGAGED: \${selectedSatellite.name}\`);
      } else {
        chaseCamActive = false;
        banner.style.display = 'none';
        if (btn) {
          btn.classList.remove('active');
          btn.innerHTML = '<span>🚀</span> CHASE CAM';
        }
      }
    }

    /**
     * Real-time animation update loop for all satellites in orbit.
     */
    function updateSatellitesTick(delta) {
      if (liveSatellites.length === 0) return;

      const now = new Date();
      satStrobeTime += delta;

      // Update positions every frame or every second
      const shouldPropagateAll = (now.getTime() - lastSatPropTime) > 1000;
      if (shouldPropagateAll) {
        lastSatPropTime = now.getTime();
      }

      for (let i = 0; i < liveSatellites.length; i++) {
        const sat = liveSatellites[i];
        if (!sat.satrec || !sat.markerGroup) continue;

        if (shouldPropagateAll) {
          const coords = getSatelliteCoordinates(sat.satrec, now);
          if (coords) {
            sat.coords = coords;
            const newPos = calculateSatellite3DPosition(coords.lat, coords.lon, coords.alt);
            sat.markerGroup.position.copy(newPos);
            sat.markerGroup.lookAt(0, 0, 0);

            // Update detailed mesh and projection if this satellite is currently selected
            if (selectedSatellite?.id === sat.id) {
              if (satDetailedMesh) {
                satDetailedMesh.position.copy(newPos);
                satDetailedMesh.lookAt(0, 0, 0);
              }
              updateSatelliteGroundProjections(sat);
              inspectSatellite(sat);
            }
          }
        }
      }

      // Animate selected satellite holographic targeting reticle & beacon
      if (satDetailedMesh) {
        satDetailedMesh.rotation.z += delta * 0.8;
      }
      if (selectedSatellite?.markerGroup?.userData?.beaconMesh) {
        const b = selectedSatellite.markerGroup.userData.beaconMesh;
        b.visible = Math.floor(satStrobeTime * 4) % 2 === 0;
      }
    }

    /**
     * Toggles visibility of the Satellite Command Net HUD Modal.
     */
    function toggleSatellitesDeck() {
      const modal = document.getElementById('satellites-modal');
      const isVisible = modal.style.display === 'flex';
      modal.style.display = isVisible ? 'none' : 'flex';

      const btn = document.getElementById('btn-satellites-toggle');
      if (btn) btn.classList.toggle('active', !isVisible);

      if (!isVisible && liveSatellites.length === 0) {
        loadLiveSatellites('all');
      }
      playSelectSound();
    }

    /**
     * Sets active satellite category filter (all, stations, starlink, gps, weather, science).
     */
    function setSatelliteFilter(cat) {
      currentSatCategory = cat;
      const tabs = document.querySelectorAll('.sat-tab');
      tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-cat') === cat));

      // Filter 3D satellite markers visibility
      for (const sat of liveSatellites) {
        if (sat.markerGroup) {
          const visible = (cat === 'all' || sat.category === cat);
          sat.markerGroup.visible = visible;
        }
      }

      renderSatellitesListHtml();
      playSelectSound();
    }

    /**
     * Filters satellite list in real-time as user types into search box.
     */
    function filterSatellitesList() {
      const input = document.getElementById('sat-search-input');
      satSearchQuery = input ? input.value : '';
      renderSatellitesListHtml();
    }

    /**
     * Toggles visibility of all 3D satellites in orbit (hide / unhide).
     */
    function toggleSatellitesVisibility(forceState) {
      if (forceState !== undefined) {
        showAllSatellites = forceState;
      } else {
        showAllSatellites = !showAllSatellites;
      }

      satellitesGroup.visible = showAllSatellites;
      if (satDetailedMesh) satDetailedMesh.visible = showAllSatellites;
      if (activeGroundLaser) activeGroundLaser.visible = showAllSatellites;
      if (activeFootprintRing) activeFootprintRing.visible = showAllSatellites;

      // Update Bottom Bar Control Button
      const btn = document.getElementById('btn-sats-hide-toggle');
      if (btn) {
        btn.classList.toggle('active', showAllSatellites);
        btn.innerHTML = showAllSatellites ? '<span>🛰️</span> SATS: VISIBLE' : '<span>🙈</span> SATS: HIDDEN';
        btn.style.borderColor = showAllSatellites ? 'rgba(0,240,255,0.45)' : 'rgba(255,82,82,0.6)';
        btn.style.color = showAllSatellites ? 'var(--cyan)' : '#ff5252';
      }

      // Update Satellite HUD Modal Control Button
      const modalBtn = document.getElementById('btn-modal-sat-vis-toggle');
      if (modalBtn) {
        modalBtn.classList.toggle('active', showAllSatellites);
        modalBtn.innerHTML = showAllSatellites ? '👁️ SATS: ON' : '🙈 SATS: OFF';
        modalBtn.style.color = showAllSatellites ? 'var(--cyan)' : '#ff5252';
        modalBtn.style.borderColor = showAllSatellites ? 'var(--cyan)' : '#ff5252';
      }

      playSelectSound();
      addTickerEvent(showAllSatellites ? '[SATELLITES] ALL ORBITING SATELLITES UNHIDDEN (VISIBLE)' : '[SATELLITES] ALL ORBITING SATELLITES HIDDEN');
    }

    /**
     * Toggles 3D orbit trajectory lines on/off.
     */
    function toggleAllOrbits() {
      showAllOrbits = !showAllOrbits;
      orbitsGroup.visible = showAllOrbits;

      const btn = document.getElementById('btn-orbits-toggle');
      if (btn) {
        btn.classList.toggle('active', showAllOrbits);
        btn.innerHTML = showAllOrbits ? '<span>⭕</span> ORBITS: ON' : '<span>⭕</span> ORBITS: OFF';
      }

      const modalBtn = document.getElementById('btn-sat-orbits-toggle');
      if (modalBtn) {
        modalBtn.classList.toggle('active', showAllOrbits);
      }
      playSelectSound();
    }

    /**
     * Toggles satellite billboard name labels in 3D.
     */
    function toggleSatelliteLabels() {
      showSatLabels = !showSatLabels;
      for (const sat of liveSatellites) {
        if (sat.markerGroup?.userData?.labelSprite) {
          sat.markerGroup.userData.labelSprite.visible = showSatLabels;
        }
      }
      const btn = document.getElementById('btn-sat-labels-toggle');
      if (btn) btn.classList.toggle('active', showSatLabels);
      playSelectSound();
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

      // Check satellite hover
      if (showAllSatellites && satellitesGroup.visible) {
        const satIntersects = raycaster.intersectObjects(satellitesGroup.children, true);
        if (satIntersects.length > 0) {
          let parent = satIntersects[0].object;
          while (parent && !parent.userData?.satData && parent.parent) {
            parent = parent.parent;
          }
          if (parent && parent.userData?.satData) {
            const s = parent.userData.satData;
            tooltip.style.display = 'block';
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = e.clientY + 'px';
            document.getElementById('tt-title').innerText = '🛰️ ' + s.name;
            const altKm = s.coords?.alt ? \`\${s.coords.alt.toFixed(0)} KM\` : '400 KM';
            const velKms = s.coords?.vel ? \`\${s.coords.vel.toFixed(2)} KM/S\` : '7.66 KM/S';
            document.getElementById('tt-ip').innerText = \`● NORAD ID #\${s.id} [\${s.orbitType || 'ORBIT'}]\`;
            const latStr = s.coords ? \`\${Math.abs(s.coords.lat).toFixed(2)}° \${s.coords.lat >= 0 ? 'N' : 'S'}\` : '--';
            const lonStr = s.coords ? \`\${Math.abs(s.coords.lon).toFixed(2)}° \${s.coords.lon >= 0 ? 'E' : 'W'}\` : '--';
            document.getElementById('tt-location').innerText = \`📍 SUB-POINT: \${latStr}, \${lonStr}\`;
            document.getElementById('tt-route').innerText = \`ALT: \${altKm} | SPEED: \${velKms} (\${s.operator || 'Space Agency'})\`;
            container.style.cursor = 'pointer';
            return;
          }
        }
      }

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

      // Check satellite click first
      if (showAllSatellites && satellitesGroup.visible) {
        const satIntersects = raycaster.intersectObjects(satellitesGroup.children, true);
        if (satIntersects.length > 0) {
          let parent = satIntersects[0].object;
          while (parent && !parent.userData?.satData && parent.parent) {
            parent = parent.parent;
          }
          if (parent && parent.userData?.satData) {
            selectSatellite(parent.userData.satData);
            return;
          }
        }
      }

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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (chaseCamActive) {
          toggleChaseCam(false);
        } else if (selectedSatellite) {
          deselectSatellite();
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

      // Propagate and animate live satellites
      if (typeof updateSatellitesTick === 'function') {
        updateSatellitesTick(delta);
      }

      // Chase Cam mode: lock camera behind and slightly above selected satellite in orbit
      if (typeof chaseCamActive !== 'undefined' && chaseCamActive && selectedSatellite?.markerGroup) {
        const satWorldPos = new THREE.Vector3();
        selectedSatellite.markerGroup.getWorldPosition(satWorldPos);
        const normal = satWorldPos.clone().normalize();
        const targetCam = satWorldPos.clone().add(normal.clone().multiplyScalar(7.5));
        camera.position.lerp(targetCam, 0.08);
        camera.lookAt(satWorldPos);
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

    // Initial Live Satellites Orbit Fetch & Recurring Telemetry Refresh
    if (typeof loadLiveSatellites === 'function') {
      loadLiveSatellites('all');
      setInterval(() => {
        loadLiveSatellites(currentSatCategory);
      }, 120000);
    }
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
