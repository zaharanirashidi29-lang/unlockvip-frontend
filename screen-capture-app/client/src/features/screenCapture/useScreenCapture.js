import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_INTERVAL_MS = 5000;

/**
 * Reusable hook for browser screen capture.
 *
 * Drop this into any React page — it does NOT handle routing or auth.
 * Your existing app keeps its own login, layout, and business logic;
 * you only call startSharing() / stopSharing() from a button.
 *
 * @param {Object} options
 * @param {number} options.intervalMs - Capture interval (default 5000)
 * @param {string} options.uploadUrl - POST endpoint for screenshots (default /api/upload)
 * @param {boolean} options.autoUpload - Upload each capture to the server (default true)
 */
export function useScreenCapture({
  intervalMs = DEFAULT_INTERVAL_MS,
  uploadUrl = "/api/upload",
  autoUpload = true,
  authHeaders = () => ({}),
  /** When false, frames are uploaded but never shown to the user (admin reviews them). */
  showPreview = false,
} = {}) {
  const [isSharing, setIsSharing] = useState(false);
  const [latestScreenshot, setLatestScreenshot] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [captureCount, setCaptureCount] = useState(0);
  const [lastUploadInfo, setLastUploadInfo] = useState(null);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(
    typeof document !== "undefined" ? document.createElement("canvas") : null
  );

  const captureFrameAsDataUrl = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  }, []);

  const uploadScreenshot = useCallback(
    async (dataUrl) => {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      return res.json();
    },
    [uploadUrl, authHeaders]
  );

  const captureAndUpload = useCallback(async () => {
    const dataUrl = captureFrameAsDataUrl();
    if (!dataUrl) return;

    if (showPreview) {
      setLatestScreenshot(dataUrl);
    }

    if (!autoUpload) {
      setCaptureCount((c) => c + 1);
      return;
    }

    try {
      const result = await uploadScreenshot(dataUrl);
      setCaptureCount((c) => {
        const next = c + 1;
        setStatusMessage(
          showPreview
            ? `Screenshot #${next} saved as ${result.filename}`
            : `Uploaded capture #${next} — viewable by admin only`
        );
        return next;
      });
      if (showPreview) {
        setLastUploadInfo(result);
      }
    } catch (err) {
      setError(`Upload error: ${err.message}`);
    }
  }, [autoUpload, captureFrameAsDataUrl, showPreview, uploadScreenshot]);

  const stopSharing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);
    setStatusMessage("Screen sharing has ended.");
  }, []);

  const startSharing = useCallback(async () => {
    setError("");
    setStatusMessage("Requesting screen sharing permission…");

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError(
        "Screen Capture API is not available. Use Chrome, Edge, Firefox, or Safari at localhost."
      );
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      } catch (firstErr) {
        if (firstErr.name === "NotSupportedError") {
          stream = await navigator.mediaDevices.getDisplayMedia();
        } else {
          throw firstErr;
        }
      }

      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      const [videoTrack] = stream.getVideoTracks();
      videoTrack.addEventListener("ended", () => stopSharing());

      setIsSharing(true);
      setStatusMessage(`Screen sharing active — capturing every ${intervalMs / 1000}s.`);
      setCaptureCount(0);

      await captureAndUpload();
      intervalRef.current = setInterval(captureAndUpload, intervalMs);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Permission denied. Screen sharing was not granted.");
      } else if (err.name === "NotSupportedError") {
        setError(
          "Screen sharing is not supported here. Use a normal browser tab (not an embedded preview)."
        );
      } else {
        setError(err.message || "Failed to start screen sharing.");
      }
      setStatusMessage("");
    }
  }, [captureAndUpload, intervalMs, stopSharing]);

  useEffect(() => () => stopSharing(), [stopSharing]);

  return {
    videoRef,
    isSharing,
    latestScreenshot,
    statusMessage,
    captureCount,
    lastUploadInfo,
    error,
    startSharing,
    stopSharing,
    setError,
  };
}
