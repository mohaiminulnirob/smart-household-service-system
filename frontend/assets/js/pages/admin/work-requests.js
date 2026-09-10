import { skeletonCard, emptyState } from "../../components/skeletonCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";

requireAuth("admin");

const container = document.getElementById("workRequests");
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");

let allRequests = []; // store full list
let isLoading = true;

async function loadRequests() {
  isLoading = true;
  container.innerHTML = "";
  container.appendChild(skeletonCard('admin-request', 5));

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.WORK_REQUESTS);
    isLoading = false;
    allRequests = Array.isArray(res?.data) ? res.data : [];

    if (!allRequests.length) {
      container.innerHTML = "";
      container.appendChild(emptyState('admin-request'));
      return;
    }

    renderRequests();

  } catch (err) {
    isLoading = false;
    container.innerHTML = `<p style="color:var(--error)">${err.message || "Failed to load requests"}</p>`;
  }
}

function renderRequests() {
  let list = [...allRequests];

  // Filtering
  const filterVal = filterSelect.value;
  if (filterVal !== "all") {
    list = list.filter(r => r.status === filterVal);
  }

  // Sorting
  const sortVal = sortSelect.value;
  list.sort((a, b) => {
    const da = new Date(a.created_at);
    const db = new Date(b.created_at);

    if (sortVal === "newest") return db - da;
    return da - db; // oldest
  });

  // Render
  container.innerHTML = "";

  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "card p-md mb-md";

    card.innerHTML = `
      <h4>${r.category} - <span class="status">${r.status}</span></h4>
      <p><b>User:</b> ${r.user_name}</p>
      <p><b>Description:</b> ${r.description}</p>
      <p><b>Location:</b> ${r.location || "N/A"}</p>
      <p><b>Assigned Worker ID:</b> ${r.assigned_worker_id || "Not assigned"}</p>
      <p class="text-muted" style="font-size:13px">⏱ ${new Date(r.created_at).toLocaleString()}</p>
    `;

    container.appendChild(card);
  });
}

// EVENT LISTENERS
sortSelect.addEventListener("change", renderRequests);
filterSelect.addEventListener("change", renderRequests);

loadRequests();
