# ⚡ Switcher Tunnel - Relay Web App (Render.com)

Ultra-fast reverse proxy relay web service deployable to Render.com with zero configuration and zero authentication.

## 🚀 1-Click Render Deployment

1. On [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Web Service**.
2. Connect this repository (`shubhyagami/switcher`).
3. Settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Health Check Path**: `/healthz`
4. Click **Create Web Service**.

Once deployed, Render gives you a live public URL (e.g. `https://switcher.onrender.com`).

## 💻 Connect from Windows Software
```powershell
switcher-tunnel 3000 --server https://<your-render-url>.onrender.com
```
