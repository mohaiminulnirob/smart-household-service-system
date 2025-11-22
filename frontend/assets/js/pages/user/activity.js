import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { currentUser, requireAuth } from "../../utils/auth.js";

requireAuth("user");

const user = currentUser();
const userId = user.id;

// Create container dynamically
const container = document.createElement("div");
container.className = "activity-container";
container.style.maxWidth = "450px";
container.style.margin = "2rem auto";
container.style.background = "rgba(255, 255, 255, 0.08)";
container.style.backdropFilter = "blur(12px)";
container.style.padding = "2rem";
container.style.borderRadius = "12px";
container.style.border = "1px solid rgba(255,255,255,0.18)";
container.style.textAlign = "center";

// Add title
container.innerHTML = `<h2 style="margin-bottom: 10px;">My Activity</h2>`;

// Append to body (or a main wrapper)
document.body.appendChild(container);

// Fetch activity from API
async function loadActivity() {
  try {
    const res = await apiFetch(ENDPOINTS.USER.VIEW_ACTIVITY(userId));

    if (!res.data || res.data.length === 0) {
      container.innerHTML += `<p>No activity found.</p>`;
      return;
    }

    const list = document.createElement("div");
    list.style.marginTop = "20px";

    res.data.forEach((item) => {
      const box = document.createElement("div");
      box.className = "profile-field";
      box.style.textAlign = "left";
      box.style.margin = "0.4rem 0";
      box.style.padding = "10px";
      box.style.background = "rgba(255,255,255,0.05)";
      box.style.borderRadius = "10px";
      box.style.border = "1px solid #ddd";

      box.innerHTML = `
        <b>${item.activity_type}</b><br>
        ${item.description}<br>
        <small>${new Date(item.performed_at).toLocaleString()}</small>
      `;

      list.appendChild(box);
    });

    container.appendChild(list);

  } catch (err) {
    container.innerHTML += `<p style="color:red">Error loading activity</p>`;
    console.error("Activity error:", err);
  }
}

loadActivity();
