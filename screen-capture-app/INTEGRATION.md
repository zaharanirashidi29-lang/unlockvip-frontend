# Integrating Screen Capture Into Your Existing Frontend

The capture logic is isolated in two files you can copy as-is:

```
client/src/features/screenCapture/
├── useScreenCapture.js      ← all capture/upload logic (hook)
└── ScreenCapturePanel.jsx   ← optional ready-made UI
```

Your existing login, routes, API calls, and pages stay untouched.

---

## Option A — Drop in the UI component (fastest)

In **any existing React page**:

```jsx
import ScreenCapturePanel from "./features/screenCapture/ScreenCapturePanel";

export default function MyExistingDashboard() {
  return (
    <div>
      {/* Everything you already had — keep it all */}
      <h1>My App</h1>
      <MyExistingTable />
      <MyExistingForms />

      {/* Add capture as a new section — nothing else changes */}
      <ScreenCapturePanel title="Screen Capture Test" />
    </div>
  );
}
```

---

## Option B — Hook only (custom UI)

Use the hook if you want your own buttons/layout:

```jsx
import { useScreenCapture } from "./features/screenCapture/useScreenCapture";

export default function MyPage() {
  const {
    videoRef,
    isSharing,
    latestScreenshot,
    startSharing,
    stopSharing,
    error,
  } = useScreenCapture({ intervalMs: 5000, uploadUrl: "/api/upload" });

  return (
    <div>
      {/* Your existing UI */}
      <button onClick={startSharing} disabled={isSharing}>Share screen</button>
      <button onClick={stopSharing} disabled={!isSharing}>Stop</button>
      {error && <p>{error}</p>}
      {latestScreenshot && <img src={latestScreenshot} alt="capture" />}
      <video ref={videoRef} hidden playsInline muted />
    </div>
  );
}
```

---

## Backend — add one route to your existing Express server

Copy the upload handler from `server/index.js` into your server (do not replace your server):

```js
const fs = require("fs");
const path = require("path");
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

app.post("/api/upload", (req, res) => {
  const { image } = req.body;
  const matches = image?.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) return res.status(400).json({ message: "Invalid image" });

  const filename = `screenshot-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, filename), Buffer.from(matches[1], "base64"));
  res.json({ success: true, filename, savedAt: new Date().toISOString() });
});
```

If your frontend runs on a different port, proxy `/api` in Vite/webpack:

```js
// vite.config.js
server: {
  proxy: { "/api": "http://localhost:YOUR_BACKEND_PORT" }
}
```

---

## What NOT to change

| Keep as-is | Why |
|------------|-----|
| Login / auth | Capture is independent; no auth required on the hook |
| Existing routes | Add a new route or embed the panel on an existing page |
| Existing API routes | Only add `POST /api/upload` |
| Existing state management | Hook manages its own state internally |

---

## Disable capture without deleting code

Remove or comment out one line:

```jsx
{/* <ScreenCapturePanel /> */}
```

Everything else in your app continues to work.
