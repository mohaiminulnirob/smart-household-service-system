import { openImageViewer } from "../utils/image-viewer.js";

export function createAdminRequestCard(req) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.marginBottom = "14px";
  card.style.padding = "14px";
  card.style.display = "flex";
  card.style.justifyContent = "space-between";
  card.style.gap = "14px";
  card.style.border = "1px solid #ddd";
  card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  card.style.borderRadius = "12px";

  const fullDesc = req.description || "";
  const shortDesc =
    fullDesc.length > 80 ? fullDesc.substring(0, 80) + "..." : fullDesc;

  const formattedDate = req.created_at
    ? new Date(req.created_at).toLocaleString()
    : "Unknown";

  const imgHTML = req.problem_Pic
    ? `<img src="${req.problem_Pic}"
        class="req-image-preview"
        style="width:120px;height:120px;object-fit:cover;border-radius:8px;cursor:pointer;">`
    : "";

  card.innerHTML = `
    <div style="flex:1">
      <h3>${req.category}</h3>
      <p style="font-size:13px;color:var(--muted)">Request ID: ${req.id}</p>

      <p class="desc-text">${shortDesc}</p>
      ${
        fullDesc.length > 80
          ? `<button class="toggle-desc btn btn-small">Show more</button>`
          : ""
      }

      <p style="color:var(--muted);margin-top:6px">
        Status: <b>${req.status}</b>
      </p>

      <p style="font-size:13px;color:var(--muted)">📍 Location: ${
        req.location || "N/A"
      }</p>
      <p style="font-size:13px;color:var(--muted)">🕒 ${formattedDate}</p>

      <div style="margin-top:8px;font-size:13px;color:var(--muted)">
        <p><b>User ID:</b> ${req.user_id}</p>
      </div>

      <div style="margin-top:8px;font-size:13px;color:var(--muted)">
      <p><b>Assigned Worker ID:</b> 
       ${req.assigned_worker_id || "None"}
      </p>
     </div>

    </div>

    <div>${imgHTML}</div>
  `;

  // Image viewer
  if (req.problem_Pic) {
    const img = card.querySelector(".req-image-preview");
    img.onclick = () => openImageViewer(req.problem_Pic);
  }

  // Description toggle
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

  return card;
}
