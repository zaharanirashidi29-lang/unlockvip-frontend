import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAdminSession } from "../utils/auth";

/**
 * Admin login page — separate from user login.
 * Admins review screenshots captured by users.
 * Test: admin / admin123
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        saveAdminSession(data.token);
        navigate("/admin");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Could not reach the server. Is the backend running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="card admin-login-card">
        <h1>Admin Login</h1>
        <p className="subtitle">Review screenshots captured by users</p>

        <form onSubmit={handleSubmit}>
          <label>
            Admin username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In as Admin"}
          </button>
        </form>

        <p className="hint">Test admin: admin / admin123</p>
        <p className="hint">
          User? <Link to="/login">Go to user login</Link>
        </p>
      </div>
    </div>
  );
}
