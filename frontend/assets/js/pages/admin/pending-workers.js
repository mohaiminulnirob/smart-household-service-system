// frontend/assets/js/pages/admin/pending-workers.js
import { skeletonCard, emptyState } from "../../components/skeletonCard.js";
import { apiFetch } from "../../utils/api-client.js";
import { ENDPOINTS } from "../../config/api.js";
import { requireAuth } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";

requireAuth("admin");

const container = document.getElementById("pendingWorkers");

async function loadPending() {
  container.innerHTML = "";
  container.appendChild(skeletonCard('pending-worker', 5));

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.PENDING_WORKERS);
    const workers = Array.isArray(res?.data) ? res.data : [];

    if (!workers.length) {
      container.innerHTML = "";
      container.appendChild(emptyState('pending-worker'));
      return;
    }

    container.innerHTML = "";
    workers.forEach(worker => {
      const card = document.createElement("div");
      card.className = "card p-sm mb-sm";
      card.innerHTML = `
        <p><b>${worker.name}</b> (${worker.skill_category}) - ${worker.location || 'N/A'}</p>

        <div class="flex-row gap-10 mt-sm">
          <button class="btn btn-primary approve-btn" data-id="${worker.id}">Approve</button>
          <button class="btn btn-danger reject-btn" data-id="${worker.id}">Reject</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Approve Action
    container.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        try {
          await apiFetch(ENDPOINTS.ADMIN.APPROVE_WORKER(id), { method: "PUT" });
          toast.success("Worker approved");
          btn.closest(".card")?.remove();
        } catch (err) {
          toast.error(err.message || "Approve failed");
          btn.disabled = false;
        }
      });
    });

    // Reject Action With Confirmation
    container.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        // Optional confirmation popup
        const confirmReject = confirm("Are you sure you want to reject? This will remove worker from system.");
        if (!confirmReject) return;

        btn.disabled = true;
        btn.textContent = "Rejecting...";

        try {
          await apiFetch(ENDPOINTS.ADMIN.REJECT_WORKER(id), { method: "PUT" });
          toast.success("Worker rejected");
          btn.closest(".card")?.remove();
        } catch (err) {
          toast.error(err.message || "Reject failed");
          btn.disabled = false;
          btn.textContent = "Reject";
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<p style="color:var(--error)">${err.message || "Failed to load pending workers"}</p>`;
  }
}

loadPending();
