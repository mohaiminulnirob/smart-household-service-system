import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";

requireAuth("admin");

const summary = document.getElementById("summary");

async function loadSummary() {
  summary.innerHTML = "<p>Loading...</p>";

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.DASHBOARD_STATS);
    const stats = res.data;

    summary.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:20px; margin-top:20px;">

        <!-- Approved Workers -->
        <div class="card" 
          style="
            flex:1; 
            background: var(--card-bg);
            min-width:220px; 
            padding:20px; 
            border:1px solid #ddd;
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h3>Total Approved Workers</h3>
          <p style="font-size:24px; font-weight:bold">${stats.approved_workers}</p>
        </div>

        <!-- Pending Workers -->
        <div class="card" 
          style="
            flex:1; 
            background: var(--card-bg);
            min-width:220px; 
            padding:20px; 
            border:1px solid #ddd;
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h3>Total Pending Workers</h3>
          <p style="font-size:24px; font-weight:bold">${stats.pending_workers}</p>
        </div>

        <!-- Completed Requests -->
        <div class="card" 
          style="
            flex:1; 
            background: var(--card-bg);
            min-width:220px; 
            padding:20px; 
            border:1px solid #ddd;
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h3>Total Completed Requests</h3>
          <p style="font-size:24px; font-weight:bold">${stats.completed_requests}</p>
        </div>

        <!-- Pending Requests -->
        <div class="card" 
          style="
            flex:1; 
            background: var(--card-bg);
            min-width:220px; 
            padding:20px; 
            border:1px solid #ddd;
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h3>Total Pending Requests</h3>
          <p style="font-size:24px; font-weight:bold">${stats.pending_requests}</p>
        </div>

        <!-- Cancelled Requests -->
        <div class="card" 
          style="
            flex:1; 
            background: var(--card-bg);
            min-width:220px; 
            padding:20px; 
            border:1px solid #ddd;
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h3>Total Cancelled Requests</h3>
          <p style="font-size:24px; font-weight:bold">${stats.cancelled_requests}</p>
        </div>

        <!-- Average Rating -->
        <div class="card" 
          style="
            flex:1; 
            background: var(--card-bg);
            min-width:220px; 
            padding:20px; 
            border:1px solid #ddd;
            border-radius:12px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <h3>Average Worker Rating</h3>
          <p style="font-size:24px; font-weight:bold">${stats.average_rating}</p>
        </div>

      </div>
    `;
  } catch (err) {
    summary.innerHTML = `<p style="color:red">${err.message || "Failed to load summary"}</p>`;
  }
}

loadSummary();
