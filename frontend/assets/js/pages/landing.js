document.addEventListener('DOMContentLoaded', async () => {
  const nums = document.querySelectorAll('.stat-number');

  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.status === 'success') {
      const stats = data.data;
      const targets = [stats.active_workers, stats.jobs_completed, stats.avg_rating];
      nums.forEach((el, i) => {
        el.dataset.target = targets[i];
      });
    }
  } catch {
    // fallback to hardcoded data-target values
  }

  nums.forEach(el => {
    const target = parseFloat(el.dataset.target || el.textContent || 0);
    let start = 0;
    const isFloat = target !== Math.floor(target);
    const duration = 1200;
    const stepTime = Math.max(16, Math.floor(duration / 60));
    const steps = Math.floor(duration / stepTime);
    let step = 0;
    const tick = () => {
      step++;
      const v = start + (target - start) * (step / steps);
      el.textContent = isFloat ? v.toFixed(1) : Math.floor(v);
      if (step < steps) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    };
    requestAnimationFrame(tick);
  });

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('active'));
  }
});
