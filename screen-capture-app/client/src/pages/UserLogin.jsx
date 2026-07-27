import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveUserSession } from "../utils/auth";

/**
 * User login page — regular users capture screenshots here.
 * Test: user / user123  or  demo / demo123
 */
export default function UserLogin() {
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
      const res = await fetch("/api/login/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        saveUserSession(data.token, data.username);
        navigate("/user");
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
      <div className="card">
        <h1>User Login</h1>
        <p className="subtitle">Sign in to start screen capture</p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user"
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
              placeholder="user123"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In as User"}
          </button>
        </form>

        <p className="hint">Test users: user / user123 · demo / demo123</p>
        <p className="hint">
          Admin? <Link to="/admin/login">Go to admin login</Link>
        </p>
      </div>
    </div>
  );
}
