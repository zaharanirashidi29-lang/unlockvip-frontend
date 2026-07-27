# Deploy to Render — beginner guide (click-by-click)

I cannot log into your Render account from here. Follow these steps once — then your phone can open the live link.

---

## Part 1 — Put code on GitHub (5 min)

### Step 1: Create a GitHub repo

1. Open [https://github.com/new](https://github.com/new)
2. Repository name: `screen-capture-app`
3. Keep it **Private** (recommended)
4. Do **not** add README or .gitignore (we already have them)
5. Click **Create repository**

### Step 2: Push your code from your Mac

Open **Terminal** and run (replace `YOUR_USERNAME`):

```bash
cd /Users/bosskwezi/azam/screen-capture-app

git init
git branch -M main
git add .
git commit -m "Initial deploy"

git remote add origin https://github.com/YOUR_USERNAME/screen-capture-app.git
git push -u origin main
```

GitHub may ask you to sign in in the browser.

---

## Part 2 — Deploy on Render (5 min)

### Step 3: New Web Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in
2. Click **New +** → **Web Service**
3. Click **Connect account** under GitHub if needed
4. Find repo **`screen-capture-app`** → **Connect**

### Step 4: Fill in these EXACT settings

| Field | Value |
|-------|--------|
| **Name** | `screen-capture-app` (or any name) |
| **Region** | Pick closest to you |
| **Branch** | `main` |
| **Root Directory** | leave empty OR `screen-capture-app` if repo root is `azam` |
| **Runtime** | `Node` |
| **Build Command** | see below |
| **Start Command** | see below |

**If your GitHub repo root IS `screen-capture-app` folder only:**

Build Command:
```bash
npm install --prefix server && npm install --prefix client && npm run build --prefix client
```

Start Command:
```bash
NODE_ENV=production node server/index.js
```

**If your whole `azam` folder is the repo**, set **Root Directory** to:
```text
screen-capture-app
```
and use the same build/start commands.

### Step 5: Environment variables

Click **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |

(Render sets `PORT` automatically — do not add PORT yourself.)

### Step 6: Deploy

1. Click **Create Web Service**
2. Wait 5–10 minutes for **Build** then **Deploy** to show **Live**
3. Your URL looks like: `https://screen-capture-app-xxxx.onrender.com`

---

## Part 3 — Use on your phone

1. Open the **Live URL** in Chrome (Android) or Safari (iOS)
2. User login: `https://YOUR-URL.onrender.com/login`
   - Username: `user`
   - Password: `user123`
3. Enter phone + PIN → tap **Buy Now** → allow screen share
4. Admin review: `https://YOUR-URL.onrender.com/admin/login`
   - Username: `admin`
   - Password: `admin123`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build failed | Check Render **Logs** tab; often wrong Root Directory |
| Site not loading | Free tier slept — wait 60s and refresh |
| Login fails | Check **Logs** for server errors |
| Screen share fails on phone | Must use **https://** URL; approve browser permission |

---

## Test health after deploy

Replace with your URL:

```bash
curl https://YOUR-APP.onrender.com/api/health
```

Expected: `{"status":"ok"}`

---

## Optional: custom domain

Render → your service → **Settings** → **Custom Domains** → add domain → update DNS at your registrar.

---

## Need help?

Send me:

1. Your Render **service name**
2. Screenshot of **Build failed** logs (if any)
3. Your GitHub repo URL

I can tell you exactly what to fix.
