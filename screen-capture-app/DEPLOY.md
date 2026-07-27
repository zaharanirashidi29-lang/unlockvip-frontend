# Deploy to a live domain (phone + HTTPS)

Screen capture **requires HTTPS** on a real phone (not `http://`).  
Deploy as **one app** so frontend and API share the same domain.

## Option A — Render.com (recommended, free tier)

You already use Render (`onrender.com`). Same flow:

### 1. Push code to GitHub

```bash
cd /Users/bosskwezi/azam
git init   # if not already a repo
git add screen-capture-app
git commit -m "Add screen capture app for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Create Web Service on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root directory:** `screen-capture-app`
   - **Runtime:** Node
   - **Build command:**
     ```bash
     npm install --prefix server && npm install --prefix client && npm run build --prefix client
     ```
   - **Start command:**
     ```bash
     NODE_ENV=production node server/index.js
     ```
   - **Instance type:** Free (or paid for persistent disk)

4. Click **Create Web Service**

### 3. Your live URL

Render gives you something like:

`https://screen-capture-app.onrender.com`

Open that on your phone.

| Page | URL |
|------|-----|
| User login | `https://YOUR-APP.onrender.com/login` |
| Checkout (after login) | `https://YOUR-APP.onrender.com/user` |
| Admin login | `https://YOUR-APP.onrender.com/admin/login` |
| Admin review | `https://YOUR-APP.onrender.com/admin` |

### 4. Custom domain (optional)

Render dashboard → your service → **Settings** → **Custom Domain** → add e.g. `capture.yourdomain.com` and follow DNS instructions.

---

## Option B — Quick test without GitHub (Render CLI)

If you use Render CLI, deploy from `screen-capture-app` with the same build/start commands above.

---

## Phone checklist

1. Use **Chrome on Android** or **Safari on iOS** (best support for screen share).
2. URL must be **https://** (Render provides this automatically).
3. Tap **Buy Now** → browser will ask to share screen — you must approve.
4. On iOS, screen capture APIs are more limited than Android; test on Android first.

---

## Login on production

| Role | URL | Credentials |
|------|-----|-------------|
| User | `/login` | `user` / `user123` |
| Admin | `/admin/login` | `admin` / `admin123` |

Change these in `server/index.js` before going public.

---

## Important notes

- **Free Render disk is ephemeral** — screenshots/videos may be lost when the service restarts. For persistence, upgrade plan or attach a disk.
- **Cold starts:** Free tier sleeps after ~15 min idle; first visit may take 30–60s.
- **Security:** This is a testing app with hard-coded passwords. Do not use for real customers without proper auth.

---

## Verify deployment

```bash
curl https://YOUR-APP.onrender.com/api/health
```

Should return: `{"status":"ok"}`

---

## Local production test (before deploy)

```bash
cd screen-capture-app
npm run install:all
npm run build
npm start
```

Open `http://localhost:3001` (single server serves UI + API).
