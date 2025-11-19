import { API_BASE_URL, ENDPOINTS } from '../config/api.js';
import { clearAuth, getUser } from '../utils/storage.js';
import { toast } from '../utils/toast.js';

/**
 * Helper to create an anchor link
 */
const createLink = (href, text, cls = '') => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  if (cls) a.className = cls;
  return a;
};

/**
 * Render navbar into target element (default #navbar-dynamic or #navbar)
 */
export function renderNavbarInto(targetId = 'navbar-dynamic') {
  const container =
    document.getElementById(targetId) ||
    document.getElementById('navbar') ||
    document.body;

  if (!container) return;

  const user = getUser(); // { id, name, email, role, token }

  // Navbar wrapper
  const nav = document.createElement('nav');
  nav.className = 'navbar card';
  nav.style.cssText =
    'display:flex;justify-content:space-between;align-items:center;padding:0.6rem 1rem;' +
    'position:sticky;top:0;z-index:999;background:var(--bg-secondary);backdrop-filter:blur(6px)';

  // Brand
  const brand = document.createElement('div');
  brand.innerHTML = `
    <a href="/index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none">
      <span style="font-size:20px">🔧</span>
      <strong style="color:var(--primary)">&nbsp;FixMate</strong>
    </a>
  `;

  // Right section
  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.gap = '12px';
  right.style.alignItems = 'center';

  /**
   * Removed:
   *   - Services
   *   - How it works
   * As requested
   */

  if (!user) {
    // Not logged in → show login/register
    right.appendChild(createLink('/pages/auth/login.html', 'Login', 'btn-secondary'));
    right.appendChild(createLink('/pages/auth/register-user.html', 'Sign up', 'btn-primary'));
  } else {
    // Logged in → role-based navbar items
    if (user.role === 'user') {
      right.appendChild(createLink('/pages/aboutUs.html', 'About Us'));
      right.appendChild(createLink('/pages/user/dashboard.html', 'Dashboard'));
    }

    if (user.role === 'worker') {
      right.appendChild(createLink('/pages/aboutUs.html', 'About Us'));
      right.appendChild(createLink('/pages/worker/dashboard.html', 'Dashboard'));
    }

   if (user.role === 'admin') {
    right.appendChild(createLink('/pages/aboutUs.html', 'About Us'));
    right.appendChild(createLink('/pages/admin/dashboard.html', 'Admin'));
  }

    // // Profile label
    // const profile = document.createElement('span');
    // profile.textContent = user.name || user.email || 'Profile';
    // profile.style.marginLeft = '8px';
    // profile.style.fontSize = '14px';
    // profile.style.color = 'var(--text-secondary)';
    // right.appendChild(profile);

    // Logout button
    const logout = document.createElement('button');
    logout.className = 'btn btn-secondary';
    logout.textContent = 'Logout';

    logout.addEventListener('click', async () => {
      try {
        // Try server logout (blacklist token)
        try {
          const token = localStorage.getItem('fixmate_token');
          if (token) {
            await fetch(API_BASE_URL + ENDPOINTS.AUTH.LOGOUT, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch (err) {
          // Ignore backend error, still clear auth
        }

        clearAuth();
        toast.success('Logged out');

        setTimeout(() => {
          location.href = '/pages/auth/login.html';
        }, 300);
      } catch (err) {
        toast.error('Logout failed');
      }
    });

    right.appendChild(logout);
  }

  // Append
  nav.appendChild(brand);
  nav.appendChild(right);

  container.innerHTML = '';
  container.appendChild(nav);
}

export default renderNavbarInto;
