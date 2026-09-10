
import { skeletonCard } from "../../components/skeletonCard.js";
import { apiFetch } from "../../utils/api-client.js";
import { ENDPOINTS } from "../../config/api.js";
import { requireAuth } from "../../utils/auth.js";

requireAuth("admin");

const summary = document.getElementById("summary");

async function loadSummary() {
  summary.innerHTML = "";
  summary.appendChild(skeletonCard('summary', 2));

  try {
    // use endpoints defined in config
    const pendingRes = await apiFetch(ENDPOINTS.ADMIN.PENDING_WORKERS);
    const requestsRes = await apiFetch(ENDPOINTS.ADMIN.WORK_REQUESTS);

    // backend returns { data: [...] }
    const pendingWorkers = Array.isArray(pendingRes?.data) ? pendingRes.data : [];
    const workRequests = Array.isArray(requestsRes?.data) ? requestsRes.data : [];

    summary.innerHTML = `
      <div class="card p-md mb-md">
        <p>Pending Workers: <b>${pendingWorkers.length}</b></p>
      </div>
      <div class="card p-md mb-md">
        <p>Work Requests: <b>${workRequests.length}</b></p>
      </div>
    `;
  } catch (err) {
    summary.innerHTML = `<p style="color:var(--error)">${err.message || "Failed to load summary"}</p>`;
  }
}

loadSummary();
