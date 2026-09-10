// frontend/assets/js/utils/auth.js

import { clearAuth, getUser, saveToken, saveUser } from './storage.js';

/*
 Call after successful login
 @param {string} token
 @param {object} user - { id, name, email, role }
*/
export function applyLogin(token, user) {
  saveToken(token);
  saveUser(user);
}

// Logout locally
export function logoutLocal() {
  clearAuth();
}

// Return current user object or null
export function currentUser() {
  return getUser();
}

// Require user to be logged in + optionally require role
export function requireAuth(role = null) {
  const user = getUser();

  // Not logged in
  if (!user) {
    window.location.href = "/pages/auth/login.html";
    return null;  //important
  }

  // Wrong role
  if (role && user.role !== role) {
    window.location.href = "/pages/auth/login.html";
    return null;  // important
  }

  // Always return user if allowed
  return user;  // FIXED
}
