# 🚂 Easy 3-Step Railway Deployment Guide

Deploying LoveDraw on Railway takes less than 2 minutes!

---

### Step 1: Connect GitHub Repository on Railway
1. Go to [railway.app](https://railway.app) and sign in.
2. Click **New Project** → Select **Deploy from GitHub repo**.
3. Select your repository: `Yashuuu011/LoveDraw-kkg`.

---

### Step 2: Set Environment Variables on Railway
In your Railway Service Dashboard, go to **Variables** tab and click **Raw Editor**, then paste:

```env
NODE_ENV=production
DATABASE_URL=file:./dev.db
JWT_SECRET=lovedraw_romantic_super_secret_key_2026
PAYMENT_MODE=demo
```

*(Railway automatically generates `$PORT` for you, so no need to set `PORT`).*

---

### Step 3: Deploy & Generate Domain!
1. Go to **Settings** → under **Networking**, click **Generate Domain** (e.g. `lovedraw-production.up.railway.app`).
2. Done! Your entire full-stack app (React Frontend + Express API) is now live on that URL! 🎉❤️
