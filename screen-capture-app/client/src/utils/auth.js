/**
 * Auth helpers — separate user and admin sessions in localStorage.
 * Users capture screenshots; admins only review them.
 */

const USER_TOKEN_KEY = "userAuthToken";
const USER_NAME_KEY = "userName";
const ADMIN_TOKEN_KEY = "adminAuthToken";

export function saveUserSession(token, username) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_NAME_KEY, username);
}

export function saveAdminSession(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearUserSession() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getUserSession() {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  const username = localStorage.getItem(USER_NAME_KEY);
  if (!token || !username) return null;
  return { token, username };
}

export function getAdminSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return null;
  return { token };
}

export function isUserLoggedIn() {
  return !!getUserSession();
}

export function isAdminLoggedIn() {
  return !!getAdminSession();
}

/** Auth header for user upload requests */
export function userAuthHeaders() {
  const session = getUserSession();
  if (!session) return {};
  return {
    Authorization: `Bearer ${session.token}`,
    "Content-Type": "application/json",
  };
}

/** Auth header for admin API requests */
export function adminAuthHeaders() {
  const session = getAdminSession();
  if (!session) return {};
  return {
    Authorization: `Bearer ${session.token}`,
  };
}
