import { createAdminWorkerCard } from "../../components/adminWorkerCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";

requireAuth("admin");

const container = document.getElementById("workersContainer");
const sortSelect = document.getElementById("sortSelect");
const skillSelect = document.getElementById("skillSelect");

let allWorkers = [];

// Load all workers
async function loadWorkers() {
  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.ALL_WORKERS);
// You will create endpoint
    allWorkers = Array.isArray(res.data) ? res.data : [];
    renderWorkers();
  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function renderWorkers() {
  let list = [...allWorkers];

  // Filter by Skill
  const skill = skillSelect.value;
  if (skill !== "all") {
    list = list.filter((w) => w.skill_category === skill);
  }

  // Sort
  const sort = sortSelect.value;
  list.sort((a, b) =>
    sort === "asc"
      ? new Date(a.created_at) - new Date(b.created_at)
      : new Date(b.created_at) - new Date(a.created_at)
  );

  // Display
  if (!list.length) {
    container.innerHTML = "<p>No workers found.</p>";
    return;
  }

  container.innerHTML = "";
  list.forEach((w) => container.appendChild(createAdminWorkerCard(w)));
}

sortSelect.addEventListener("change", renderWorkers);
skillSelect.addEventListener("change", renderWorkers);

loadWorkers();

/* ------------------ SEARCH FEATURE ------------------ */

document.getElementById("searchBtn").addEventListener("click", () => {
  const value = document.getElementById("searchInput").value.trim();

  if (!value) {
    alert("Please enter worker ID");
    return;
  }

  const id = Number(value);
  const result = allWorkers.filter((w) => Number(w.id) === id);

  if (!result.length) {
    container.innerHTML = `<p>No worker found with ID: ${id}</p>`;
    return;
  }

  container.innerHTML = "";
  result.forEach((w) => container.appendChild(createAdminWorkerCard(w)));
});

// RESET
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  renderWorkers();
});
