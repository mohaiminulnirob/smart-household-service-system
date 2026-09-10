import { apiFetch } from "../utils/api-client.js";
import { toast } from "../utils/toast.js";

export function createPendingWorkerCard(worker) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.padding = "14px";
  card.style.marginBottom = "14px";

  card.innerHTML = `
    <h3>${worker.name}</h3>
    <p>Email: ${worker.email}</p>
    <p>Skill: <b>${worker.skill_category}</b></p>
    <p>Location: ${worker.location || "N/A"}</p>

    <button class="btn btn-primary approveBtn" style="margin-top:10px">
      Approve Worker
    </button>
  `;

  card.querySelector(".approveBtn").onclick = async () => {
    try {
      await apiFetch(`/api/admin/workers/${worker.id}/approve`, {
        method: "PUT"
      });

      toast.success("Worker approved");
      card.remove();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return card;
}
