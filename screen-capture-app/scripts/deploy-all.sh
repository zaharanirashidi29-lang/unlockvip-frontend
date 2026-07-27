#!/bin/bash
# One-click deploy helper — uses your existing GitHub account (zaharanirashidi29-lang)
# Run from Terminal: bash scripts/deploy-all.sh

set -e

GITHUB_USER="zaharanirashidi29-lang"
FRONTEND_REPO="/Users/bosskwezi/unlockvip-frontend"
CAPTURE_SRC="/Users/bosskwezi/azam/screen-capture-app"
TARGET_DIR="screen-capture-app"

echo "=== Deploy screen-capture-app via unlockvip-frontend repo ==="
echo ""

# 1. Copy app into your existing frontend repo (same GitHub account as unlockvip)
if [ ! -d "$FRONTEND_REPO/.git" ]; then
  echo "ERROR: unlockvip-frontend not found at $FRONTEND_REPO"
  exit 1
fi

echo "[1/4] Copying files to unlockvip-frontend/$TARGET_DIR ..."
rsync -a --delete \
  --exclude node_modules \
  --exclude client/dist \
  --exclude .git \
  --exclude server/screenshots/*.png \
  --exclude server/screenshots/*.webm \
  "$CAPTURE_SRC/" "$FRONTEND_REPO/$TARGET_DIR/"

# 2. Commit on unlockvip-frontend
echo "[2/4] Git commit..."
cd "$FRONTEND_REPO"
git add "$TARGET_DIR"
git status --short "$TARGET_DIR" | head -20

if git diff --cached --quiet; then
  echo "  No changes to commit (already up to date)."
else
  git commit -m "Add screen capture app for Render deployment ($TARGET_DIR)"
fi

# 3. Push to GitHub (uses your saved GitHub login from unlockvip)
echo "[3/4] Pushing to GitHub..."
git push origin main

echo ""
echo "[4/4] DONE — code is on GitHub!"
echo ""
echo "=============================================="
echo "  NOW: Create Render Web Service (2 minutes)"
echo "=============================================="
echo ""
echo "1. Open: https://dashboard.render.com"
echo "2. New + → Web Service"
echo "3. Connect repo: $GITHUB_USER/unlockvip-frontend"
echo "4. Settings:"
echo "   Name: screen-capture-app"
echo "   Root Directory: $TARGET_DIR"
echo "   Build Command:"
echo "     npm install --prefix server && npm install --prefix client && npm run build --prefix client"
echo "   Start Command:"
echo "     NODE_ENV=production node server/index.js"
echo "5. Environment: NODE_ENV = production"
echo "6. Create Web Service"
echo ""
echo "Your phone URL will be: https://screen-capture-app-xxxx.onrender.com"
echo "  User login:  /login     (user / user123)"
echo "  Admin login: /admin/login (admin / admin123)"
echo ""
