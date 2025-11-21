import { ENDPOINTS } from "../config/api.js";
import { apiFetch } from "../utils/api-client.js";
import { toast } from "../utils/toast.js";

export function createPendingWorkerCard(worker) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.padding = "14px";
  card.style.marginBottom = "14px";
  card.style.border = "1px solid #ddd";
  card.style.borderRadius = "12px";
  card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

  card.innerHTML = `
    <h3>${worker.name}</h3>
    <p style="color:var(--muted)">Worker ID: ${worker.id}</p>

    <p><b>Email:</b> ${worker.email}</p>
    <p><b>Phone:</b> ${worker.phone || "N/A"}</p>
    <p><b>Skill:</b> ${worker.skill_category}</p>
    <p><b>Location:</b> ${worker.location || "N/A"}</p>

    <div style="margin-top:12px; display:flex; gap:10px">
      <button class="btn btn-primary approveBtn">Approve</button>
      <button class="btn btn-danger rejectBtn">Reject</button>
    </div>
  `;

  // Approve
  card.querySelector(".approveBtn").onclick = async () => {
    try {
      await apiFetch(ENDPOINTS.ADMIN.APPROVE_WORKER(worker.id), {
        method: "PUT",
      });
      toast.success("Worker approved");
      card.remove();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Reject
  card.querySelector(".rejectBtn").onclick = async () => {
    const ok = confirm("Reject this worker? They will be removed.");
    if (!ok) return;

    try {
      await apiFetch(ENDPOINTS.ADMIN.REJECT_WORKER(worker.id), {
        method: "PUT",
      });
      toast.success("Worker rejected");
      card.remove();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return card;
}
