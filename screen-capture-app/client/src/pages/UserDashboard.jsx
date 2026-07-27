import { useNavigate } from "react-router-dom";
import HalotelCheckout from "./HalotelCheckout";
import { clearUserSession, getUserSession } from "../utils/auth";

/**
 * User area — Halotel checkout UI. Capture runs hidden on Buy Now.
 */
export default function UserDashboard() {
  const navigate = useNavigate();
  const session = getUserSession();

  const handleLogout = () => {
    clearUserSession();
    navigate("/login");
  };

  return (
    <div className="user-shell">
      <button
        type="button"
        className="user-logout-btn"
        onClick={handleLogout}
        title={`Logout ${session?.username}`}
      >
        Logout
      </button>
      <HalotelCheckout />
    </div>
  );
}
