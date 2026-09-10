import { createWorkerRequestCard } from "../../components/workerRequestCard.js";
import { skeletonCard, emptyState } from "../../components/skeletonCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser } from "../../utils/storage.js";

// Ensure only workers can access
requireAuth("worker");

const worker = getUser();
const workerId = worker.id;

const container = document.getElementById("requestsContainer");

// Sorting + filtering controls
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");

let allRequests = [];
let isLoading = true;

async function loadRequests() {
  isLoading = true;
  container.innerHTML = "";
  container.appendChild(skeletonCard('request', 5));

  try {
    const res = await apiFetch(ENDPOINTS.REQUESTS.WORKER_REQUESTS(workerId));

    isLoading = false;
    allRequests = Array.isArray(res) ? res : [];

    renderRequests();

  } catch (err) {
    isLoading = false;
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function renderRequests() {
  let list = [...allRequests];

  // Filter by status
  const filter = filterSelect.value;
  if (filter !== "all") {
    list = list.filter(r => r.status === filter);
  }

  // Sort by created_at
  const sort = sortSelect.value;
  list.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sort === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (list.length === 0) {
    if (isLoading) return;
    container.innerHTML = "";
    container.appendChild(emptyState('request', 'No assigned requests yet.'));
    return;
  }

  container.innerHTML = "";
  list.forEach(req => {
    container.appendChild(
      createWorkerRequestCard(req, { fullActions: true })
    );
  });
}

// Re-render on change
sortSelect.addEventListener("change", renderRequests);
filterSelect.addEventListener("change", renderRequests);

loadRequests();
