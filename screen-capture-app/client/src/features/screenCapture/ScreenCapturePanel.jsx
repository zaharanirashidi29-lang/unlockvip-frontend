import { useScreenCapture } from "./useScreenCapture";
import { userAuthHeaders } from "../../utils/auth";

/**
 * Screen capture panel for logged-in users.
 * Captures upload to the server — users do NOT see screenshots here.
 * Admins review all captures on the admin dashboard.
 */
export default function ScreenCapturePanel({ title = "Screen Capture", className = "" }) {
  const {
    videoRef,
    isSharing,
    statusMessage,
    captureCount,
    error,
    startSharing,
    stopSharing,
  } = useScreenCapture({
    authHeaders: userAuthHeaders,
    showPreview: false,
  });

  return (
    <div className={`screen-capture-panel ${className}`.trim()}>
      <h2>{title}</h2>
      <p className="panel-hint">
        Grant browser permission to share your screen. Captures are sent to the server
        automatically — only admins can view them.
      </p>

      <div className="button-row">
        <button
          className="btn-primary"
          onClick={startSharing}
          disabled={isSharing}
          type="button"
        >
          Start Screen Sharing
        </button>
        <button
          className="btn-danger"
          onClick={stopSharing}
          disabled={!isSharing}
          type="button"
        >
          Stop Sharing
        </button>
      </div>

      {statusMessage && (
        <p className={`status ${isSharing ? "status-active" : "status-ended"}`}>
          {statusMessage}
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {captureCount > 0 && (
        <p className="meta">{captureCount} capture(s) uploaded this session</p>
      )}

      {/* Hidden video — required for frame grabs; never shown to the user */}
      <video ref={videoRef} style={{ display: "none" }} playsInline muted />
    </div>
  );
}
