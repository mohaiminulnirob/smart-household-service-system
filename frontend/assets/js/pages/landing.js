import { ENDPOINTS } from "../config/api.js";
import { apiFetch } from "../utils/api-client.js";

async function loadLandingStats() {
  try {
    const res = await apiFetch(ENDPOINTS.REQUESTS.STATS);
    const stats = res.data;

    // Set dynamic values
    document.querySelector("#statWorkers").dataset.target = stats.approved_workers;
    document.querySelector("#statCompleted").dataset.target = stats.completed_requests;
    document.querySelector("#statRating").dataset.target = stats.average_rating;

    animateStats(); // start animation AFTER numbers set
  } catch (err) {
    console.error("Landing stats failed:", err);
  }
}

// animate stat numbers
function animateStats() {
  const nums = document.querySelectorAll(".stat-number");

  nums.forEach((el) => {
    const target = parseFloat(el.dataset.target || "0");
    let start = 0;
    const isFloat = target % 1 !== 0;
    const duration = 1200;
    const steps = 60;
    let step = 0;

    function tick() {
      step++;
      const progress = step / steps;
      const value = start + (target - start) * progress;
      el.textContent = isFloat ? value.toFixed(1) : Math.floor(value);

      if (step < steps) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    }

    requestAnimationFrame(tick);
  });
}

// mobile nav toggle (kept original)
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("active"));
  }

  loadLandingStats();
});
