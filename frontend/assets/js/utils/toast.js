const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const COLORS = {
  success: { bar: '#10b981', border: '#10b981' },
  error: { bar: '#ef4444', border: '#ef4444' },
  warning: { bar: '#f59e0b', border: '#f59e0b' },
  info: { bar: '#3b82f6', border: '#3b82f6' },
};

function getToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

export function showToast(message = '', type = 'info', duration = 3500) {
  const container = getToastContainer();
  const el = document.createElement('div');
  el.className = `fm-toast fm-toast-${type}`;

  const color = COLORS[type] || COLORS.info;

  el.innerHTML = `
    <strong class="fm-toast-icon">${ICONS[type] || 'ℹ'}</strong>
    <div class="fm-toast-body">${message}</div>
    <button class="fm-toast-close" aria-label="close">×</button>
    <div class="fm-toast-progress" style="background:${color.bar}"></div>
  `;

  el.style.borderLeftColor = color.border;
  container.appendChild(el);

  el.querySelector('.fm-toast-close').addEventListener('click', () => {
    removeToast(el);
  });

  el._timeout = setTimeout(() => {
    removeToast(el);
  }, duration);
}

function removeToast(el) {
  if (el._removing) return;
  el._removing = true;
  clearTimeout(el._timeout);
  el.classList.add('fm-toast-removing');
  const prog = el.querySelector('.fm-toast-progress');
  if (prog) prog.style.animationPlayState = 'paused';
  setTimeout(() => el.remove(), 300);
}

export const toast = {
  success: (m, d) => showToast(m, 'success', d),
  error: (m, d) => showToast(m, 'error', d),
  warning: (m, d) => showToast(m, 'warning', d),
  info: (m, d) => showToast(m, 'info', d),
};
