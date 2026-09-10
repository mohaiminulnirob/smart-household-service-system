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
      <img src="/assets/images/fixmate-logo.png" alt="FixMate" style="height:24px;width:24px">
      <strong style="color:var(--primary)">&nbsp;FixMate</strong>
    </a>
  `;

  // Right section
  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.gap = '24px';
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
      right.appendChild(createLink('/pages/user/dashboard.html', 'Dashboard'));
      right.appendChild(createLink('/pages/user/my-requests.html', 'My Requests'));
      right.appendChild(createLink('/pages/user/create-request.html', 'Create Request'));
      right.appendChild(createLink('/pages/user/profile.html', 'Profile'));
    }

    if (user.role === 'worker') {
      right.appendChild(createLink('/pages/worker/dashboard.html', 'Dashboard'));
      right.appendChild(createLink('/pages/worker/my-requests.html', 'My Jobs'));
      right.appendChild(createLink('/pages/worker/ratings.html', 'Ratings'));
      right.appendChild(createLink('/pages/worker/profile.html', 'Profile'));
    }

   if (user.role === 'admin') {
    right.appendChild(createLink('/pages/admin/dashboard.html', 'Admin'));
    right.appendChild(createLink('/pages/admin/pending-workers.html', 'Pending Workers'));
    right.appendChild(createLink('/pages/admin/work-requests.html', 'Work Requests'));
    right.appendChild(createLink('/pages/admin/profile.html', 'Profile'));
  }

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
