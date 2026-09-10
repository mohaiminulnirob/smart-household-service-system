import { ENDPOINTS } from "../config/api.js";
import { apiFetch } from "../utils/api-client.js";
import { openImageViewer } from "../utils/image-viewer.js";
import { toast } from "../utils/toast.js";


export function createWorkerRequestCard(req, opts = {}) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.padding = "14px";
  card.style.marginBottom = "14px";
  card.style.display = "flex";
  card.style.justifyContent = "space-between";
  card.style.gap = "14px";

  const fullDesc = req.description || "";
  const shortDesc =
    fullDesc.length > 80 ? fullDesc.substring(0, 80) + "..." : fullDesc;

  // Format date
  const formattedDate = req.created_at
    ? new Date(req.created_at).toLocaleString()
    : "Unknown";

  const imgHTML = req.problem_pic
    ? `
      <img src="${req.problem_pic}" 
        class="req-image-preview"
        style="width:120px;height:120px;object-fit:cover;border-radius:8px;cursor:pointer;" />
    `
    : ""; // show nothing

  card.innerHTML = `
    <div style="flex:1;">
      <h3>${req.category}</h3>

      <p class="desc-text">${shortDesc}</p>
      ${
        fullDesc.length > 80
          ? `<button class="toggle-desc btn btn-small">Show more</button>`
          : ""
      }

      <p style="color:var(--muted)">Status: <b>${req.status}</b></p>

      <p style="font-size:13px;color:var(--muted)">📌 Location: ${req.location}</p>
      <p style="font-size:13px;color:var(--muted)">🕒 Requested: ${formattedDate}</p>

      <div style="font-size:12px;color:var(--muted);margin-top:6px;">
        <p><b>User Info:</b></p>
        <p>Name: ${req.user_name}</p>
        <p>Email: ${req.user_email}</p>
        <p>Phone: ${req.user_phone || "Not provided"}</p>
      </div>

      <div class="actions" style="margin-top:10px"></div>
    </div>

    <div>${imgHTML}</div>
  `;

  /* -------------- Image viewer -------------- */
  if (req.problem_pic) {
    const img = card.querySelector(".req-image-preview");
    img.onclick = () => openImageViewer(req.problem_pic);
  }

  /* Description toggle */
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

  const act = card.querySelector(".actions");

  if (opts.fullActions) {
    if (req.status.toLowerCase() === "assigned") {
      const acceptBtn = document.createElement("button");
      acceptBtn.className = "btn btn-primary";
      acceptBtn.textContent = "Accept";
      acceptBtn.onclick = () => updateRequest(req.id, "accept", card);
      act.appendChild(acceptBtn);

      const rejectBtn = document.createElement("button");
      rejectBtn.className = "btn btn-danger";
      rejectBtn.textContent = "Reject";
      rejectBtn.onclick = () => updateRequest(req.id, "reject", card);
      act.appendChild(rejectBtn);
    }

    if (req.status.toLowerCase() === "accepted") {
      const navBtn = document.createElement("button");
      navBtn.className = "btn btn-primary";
      navBtn.textContent = "Navigate";
      navBtn.onclick = () => openNavigation(req);
      act.appendChild(navBtn);

      const compBtn = document.createElement("button");
      compBtn.className = "btn btn-secondary";
      compBtn.textContent = "Mark Completed";
      compBtn.onclick = () => updateRequest(req.id, "complete", card);
      act.appendChild(compBtn);
    }
  }

  return card;
}


/* UPDATE REQUEST */
async function updateRequest(id, action, card) {
  try {
    const endpoint =
      action === "accept"
        ? ENDPOINTS.REQUESTS.ACCEPT(id)
        : action === "reject"
        ? ENDPOINTS.REQUESTS.REJECT(id)
        : ENDPOINTS.REQUESTS.COMPLETE(id);

    await apiFetch(endpoint, { method: "PUT" });
    toast.success(`Request ${action}ed`);
    card.remove();
  } catch (err) {
    toast.error(err.message);
  }
}

/* NAVIGATION */
function openNavigation(req) {
  const destLat = req.latitude;
  const destLng = req.longitude;

  if (!destLat || !destLng) return toast.error("User location unavailable");

  if (!navigator.geolocation) {
    return openDestinationOnly(destLat, destLng);
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const workerLat = pos.coords.latitude;
      const workerLng = pos.coords.longitude;

      const url = `https://www.google.com/maps/dir/?api=1&origin=${workerLat},${workerLng}&destination=${destLat},${destLng}&travelmode=driving`;

      window.open(url, "_blank");
    },
    () => openDestinationOnly(destLat, destLng)
  );
}

function openDestinationOnly(lat, lng) {
  window.open(`https://www.google.com/maps/place/${lat},${lng}`, "_blank");
}
