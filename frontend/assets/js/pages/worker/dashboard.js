import { createWorkerRequestCard } from "../../components/workerRequestCard.js";
import { skeletonCard, emptyState } from "../../components/skeletonCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { currentUser, requireAuth } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";

// Require worker authentication
requireAuth("worker");

// Logged-in worker
const worker = currentUser();
const workerId = worker.id;

const container = document.getElementById("recentRequests");

let isLoading = true;

/* -------------------- LOAD RECENT REQUESTS -------------------- */
async function loadRecent() {
  isLoading = true;
  container.innerHTML = "";
  container.appendChild(skeletonCard('request', 3));

  try {
    const res = await apiFetch(ENDPOINTS.REQUESTS.WORKER_REQUESTS(workerId));

    isLoading = false;
    container.innerHTML = "";

    if (!Array.isArray(res) || res.length === 0) {
      container.appendChild(emptyState('request', 'No assigned work yet. Wait for a user to request your service.'));
      return;
    }

    res.slice(0, 3).forEach((req) => {
      container.appendChild(createWorkerRequestCard(req));
    });
  } catch (err) {
    isLoading = false;
    container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

loadRecent();


