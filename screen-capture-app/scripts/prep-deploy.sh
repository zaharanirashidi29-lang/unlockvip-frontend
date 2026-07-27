#!/bin/bash
# Beginner deploy helper — run from screen-capture-app folder
set -e

echo "=== Screen Capture App — Deploy Prep ==="

# 1. Test production build locally
echo ""
echo "[1/3] Building app..."
npm install --prefix server
npm install --prefix client
npm run build --prefix client

echo ""
echo "[2/3] Testing production server..."
export NODE_ENV=production
timeout 3 node server/index.js &
sleep 2
curl -sf http://localhost:3001/api/health && echo " ✓ Health OK" || echo " ✗ Server check failed"
kill %1 2>/dev/null || true

echo ""
echo "[3/3] Git status..."
if [ ! -d .git ]; then
  git init
  git branch -M main
  echo "  Created git repo. Next: push to GitHub, then connect on Render."
else
  echo "  Git repo exists."
fi

echo ""
echo "=== DONE ==="
echo ""
echo "NEXT: Follow BEGINNER_RENDER.md step by step (about 10 minutes)"
