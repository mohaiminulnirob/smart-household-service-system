
const TOKEN_KEY = 'fixmate_token';
const USER_KEY = 'fixmate_user'; // store { id, name, role, email } JSON

export function saveToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user) {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}

export function clearAuth() {
  removeToken();
  localStorage.removeItem(USER_KEY);
}
