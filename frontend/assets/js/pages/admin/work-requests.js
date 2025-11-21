import { createAdminRequestCard } from "../../components/adminRequestCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";

requireAuth("admin");

const container = document.getElementById("requestsContainer");
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");

let allRequests = [];

async function loadRequests() {
  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.WORK_REQUESTS);

    allRequests = Array.isArray(res.data) ? res.data : [];

    renderRequests();

  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function renderRequests() {
  let list = [...allRequests];

  // Filtering
  const filter = filterSelect.value;
  if (filter !== "all") {
    list = list.filter((r) => r.status === filter);
  }

  // Sorting
  const sort = sortSelect.value;
  list.sort((a, b) => {
    const da = new Date(a.created_at);
    const db = new Date(b.created_at);
    return sort === "asc" ? da - db : db - da;
  });

  if (!list.length) {
    container.innerHTML = "<p>No requests found.</p>";
    return;
  }

  container.innerHTML = "";
  list.forEach((r) => container.appendChild(createAdminRequestCard(r)));
}

sortSelect.addEventListener("change", renderRequests);
filterSelect.addEventListener("change", renderRequests);

loadRequests();
/* --------------------- SEARCH FEATURE --------------------- */

document.getElementById("searchBtn").addEventListener("click", () => {
  const type = document.getElementById("searchType").value;
  const value = document.getElementById("searchInput").value.trim();

  if (!value) {
    alert("Please enter an ID to search.");
    return;
  }

  // Convert to number for accurate matching
  const numValue = Number(value);

  const results = allRequests.filter((r) => Number(r[type]) === numValue);

  if (!results.length) {
    container.innerHTML = `<p>No results found for ${type}: ${value}</p>`;
    return;
  }

  container.innerHTML = "";
  results.forEach((r) => container.appendChild(createAdminRequestCard(r)));
});

// RESET SEARCH
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  renderRequests(); // reload full list using your existing function
});
