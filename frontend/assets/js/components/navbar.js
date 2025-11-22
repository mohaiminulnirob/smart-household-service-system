import { API_BASE_URL, ENDPOINTS } from '../config/api.js';
import { clearAuth, getUser } from '../utils/storage.js';
import { toast } from '../utils/toast.js';

//Create a link that visually looks like a button
const createBtnLink = (href, text, variant = "btn-secondary") => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  a.className = `btn ${variant}`;
  a.style.textDecoration = "none";
  a.style.display = "inline-block";
  return a;
};

export function renderNavbarInto(targetId = 'navbar-dynamic') {
  const container =
    document.getElementById(targetId) ||
    document.getElementById('navbar') ||
    document.body;

  if (!container) return;

  const user = getUser();

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

  // Right side
  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.gap = '12px';
  right.style.alignItems = 'center';

  if (!user) {
    // Not logged in
    right.appendChild(createBtnLink('/pages/auth/login.html', 'Login', 'btn-secondary'));
    right.appendChild(createBtnLink('/pages/auth/register-user.html', 'Sign up', 'btn-primary'));
  } else {
    // Logged in → Role based
    if (user.role === 'user') {
      right.appendChild(createBtnLink('/pages/aboutUs.html', 'About Us', 'btn-secondary'));
      right.appendChild(createBtnLink('/pages/user/dashboard.html', 'Dashboard', 'btn-secondary'));
    }

    if (user.role === 'worker') {
      right.appendChild(createBtnLink('/pages/aboutUs.html', 'About Us', 'btn-secondary'));
      right.appendChild(createBtnLink('/pages/worker/dashboard.html', 'Dashboard', 'btn-secondary'));
    }

    if (user.role === 'admin') {
      right.appendChild(createBtnLink('/pages/aboutUs.html', 'About Us', 'btn-secondary'));
      right.appendChild(createBtnLink('/pages/admin/dashboard.html', 'Admin', 'btn-secondary'));
    }

    // LOGOUT BUTTON
    const logout = document.createElement('button');
    logout.className = 'btn btn-secondary';
    logout.textContent = 'Logout';

    logout.addEventListener('click', async () => {
      try {
        const token = localStorage.getItem('fixmate_token');
        if (token) {
          await fetch(API_BASE_URL + ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
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

  nav.appendChild(brand);
  nav.appendChild(right);

  container.innerHTML = '';
  container.appendChild(nav);
}

export default renderNavbarInto;
