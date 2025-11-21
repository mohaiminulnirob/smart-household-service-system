import { createPendingWorkerCard } from "../../components/workerPendingCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";

requireAuth("admin");

const container = document.getElementById("pendingWorkers");

async function loadPendingWorkers() {
  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.PENDING_WORKERS);
    const workers = Array.isArray(res.data) ? res.data : [];

    if (!workers.length) {
      container.innerHTML = "<p>No pending workers.</p>";
      return;
    }

    container.innerHTML = "";
    workers.forEach((worker) =>
      container.appendChild(createPendingWorkerCard(worker))
    );

  } catch (err) {
    container.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

loadPendingWorkers();
