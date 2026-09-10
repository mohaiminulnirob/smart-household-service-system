import { ENDPOINTS } from "../config/api.js";
import { apiFetch } from "../utils/api-client.js";
import { openImageViewer } from "../utils/image-viewer.js";
import { toast } from "../utils/toast.js";


export function createRequestCard(request, opts = {}) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.marginBottom = "14px";
  card.style.padding = "14px";
  card.style.display = "flex";
  card.style.justifyContent = "space-between";
  card.style.gap = "14px";

  // Prepare description
  const fullDesc = request.description || "";
  const shortDesc =
    fullDesc.length > 80 ? fullDesc.substring(0, 80) + "..." : fullDesc;

  // Format date
  const formattedDate = request.created_at
    ? new Date(request.created_at).toLocaleString()
    : "Unknown";

  // IMAGE (viewable)
  const imgHTML = request.problem_pic
    ? `
      <img src="${request.problem_pic}" 
        class="req-image-preview"
        style="width:120px;height:120px;object-fit:cover;border-radius:8px;cursor:pointer;" 
      />
    `
    : ""; // NO PLACEHOLDER

  // Build card layout
  card.innerHTML = `
    <div style="flex:1;">
      <h3 style="margin:0">${request.category}</h3>

      <p class="desc-text" style="margin-top:6px">${shortDesc}</p>
      ${
        fullDesc.length > 80
          ? `<button class="toggle-desc btn btn-small" style="margin-bottom:6px;">Show more</button>`
          : ""
      }

      <p style="color:var(--muted);margin:4px 0">
        Status: <b>${request.status}</b>
      </p>

      <p style="font-size:13px;color:var(--muted)">📌 Location: ${request.location}</p>
      <p style="font-size:13px;color:var(--muted)">🕒 Requested: ${formattedDate}</p>

      ${
        request.worker_name
          ? `
        <p style="font-size:13px;color:var(--muted);margin-top:6px">
          Assigned Worker: <b>${request.worker_name}</b><br>
          Phone: ${request.worker_phone || "Not provided"}
        </p>`
          : `<p style="font-size:13px;color:var(--muted);margin-top:6px">No worker assigned</p>`
      }

      <div class="actions" style="margin-top:10px"></div>
    </div>

    <!-- Right image (only if exists) -->
    <div>${imgHTML}</div>
  `;

  /* ---------------- IMAGE VIEWER ---------------- */
  if (request.problem_pic) {
    const img = card.querySelector(".req-image-preview");
    img.onclick = () => openImageViewer(request.problem_pic);
  }

  /* ---------------- Description toggle ---------------- */
  const descEl = card.querySelector(".desc-text");
  const toggleBtn = card.querySelector(".toggle-desc");

  if (toggleBtn) {
    let expanded = false;
    toggleBtn.onclick = () => {
      expanded = !expanded;
      descEl.textContent = expanded ? fullDesc : shortDesc;
      toggleBtn.textContent = expanded ? "Show less" : "Show more";
    };
  }

  const actions = card.querySelector(".actions");

  const statusLower = request.status.toLowerCase();

  // Cancel
  if (opts.showCancel && !["completed", "cancelled"].includes(statusLower)) {
    const btn = document.createElement("button");
    btn.className = "btn btn-danger";
    btn.textContent = "Cancel";
    btn.onclick = (e) => {
      e.stopPropagation();
      cancelRequest(request.id, card);
    };
    actions.appendChild(btn);
  }

  // Rating
  if (statusLower === "completed" && request.assigned_worker_id) {
    const rateBtn = document.createElement("button");

    if (request.user_has_rated) {
      rateBtn.className = "btn btn-secondary";
      rateBtn.textContent = "Worker Rated";
      rateBtn.disabled = true;
    } else {
      rateBtn.className = "btn btn-primary";
      rateBtn.textContent = "Rate Worker";
      rateBtn.onclick = () => openRatingModal(request, rateBtn);
    }

    actions.appendChild(rateBtn);
  }

  return card;
}

/* ---------------- CANCEL REQUEST ---------------- */
async function cancelRequest(id, card) {
  if (!confirm("Cancel this request?")) return;

  try {
    await apiFetch(ENDPOINTS.REQUESTS.CANCEL(id), { method: "PUT" });
    toast.success("Cancelled");
    card.remove();
  } catch (err) {
    toast.error(err.message || "Cancel failed");
  }
}

/* ---------------- RATING ---------------- */
function openRatingModal(request, btn) {
  const score = prompt("Rate the worker (1-5):");
  if (!score) return;

  const rating = Number(score);
  if (rating < 1 || rating > 5) return toast.error("Rating must be 1–5");

  const comment = prompt("Optional comment:") || "";
  submitRating(request, rating, comment, btn);
}

async function submitRating(request, rating, comment, btn) {
  try {
    const payload = {
      request_id: request.id,
      rater_id: request.user_id,
      ratee_id: request.assigned_worker_id,
      score: rating,
      comment,
    };

    await apiFetch(ENDPOINTS.RATINGS.ADD, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    toast.success("Rating submitted!");

    if (btn) {
      btn.className = "btn btn-secondary";
      btn.textContent = "Worker Rated";
      btn.disabled = true;
    }
  } catch (err) {
    toast.error(err.message);
  }
}
