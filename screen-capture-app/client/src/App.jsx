import { Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { isAdminLoggedIn, isUserLoggedIn } from "./utils/auth";

/** Only logged-in users can access the capture page */
function UserRoute({ children }) {
  return isUserLoggedIn() ? children : <Navigate to="/login" replace />;
}

/** Only logged-in admins can access the review page */
function AdminRoute({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}

/**
 * Routes:
 *   /login         → user login
 *   /user          → user screen capture dashboard
 *   /admin/login   → admin login (separate page)
 *   /admin         → admin screenshot review dashboard
 */
export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isUserLoggedIn() ? <Navigate to="/user" replace /> : <UserLogin />
        }
      />
      <Route
        path="/user"
        element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        }
      />

      <Route
        path="/admin/login"
        element={
          isAdminLoggedIn() ? <Navigate to="/admin" replace /> : <AdminLogin />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/user" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
