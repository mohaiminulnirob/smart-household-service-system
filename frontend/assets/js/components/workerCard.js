import { toast } from "../utils/toast.js";

// /**
//  * Creates a worker selection card (no view button).
//  * @param {Object} worker - worker data from backend
//  * @param {Function} onSelect - callback when user selects worker
//  */
export function createNearbyWorkerCard(worker, onSelect) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.padding = "12px";
  card.style.marginBottom = "10px";
  card.style.cursor = "pointer";
  card.style.transition = "0.2s";
  card.style.borderRadius = "8px";

  card.innerHTML = `
    <div style="font-weight:700; font-size:16px;">
      ${worker.name}
      ${worker.rating ? `• ⭐ ${Number(worker.rating).toFixed(1)}` : ""}
    </div>

    <div style="font-size:13px;color:var(--muted)">
      ${worker.skill_category}
    </div>

    <div style="font-size:13px;color:var(--muted)">
      Distance: ${Number(worker.distance).toFixed(2)} km
    </div>
  `;

  // Select worker logic
  card.onclick = () => {
    onSelect(worker, card);
    toast.success(`Selected ${worker.name}`);
  };

  return card;
}
