import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { currentUser, requireAuth } from "../../utils/auth.js";

requireAuth("worker");

const worker = currentUser();

const summary = document.getElementById("summary");
const list = document.getElementById("ratingsContainer");

const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");

let allRatings = [];
let workerSummary = null;

async function loadRatings() {
  list.innerHTML = "<p>Loading ratings...</p>";

  try {
    const res = await apiFetch(
      ENDPOINTS.RATINGS.GET_WORKER_RATINGS(worker.id)
    );

    workerSummary = res.worker;
    allRatings = Array.isArray(res.ratings) ? res.ratings : [];

    renderSummary();
    renderRatings();

  } catch (err) {
    summary.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function renderSummary() {
  summary.innerHTML = `
    <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:1rem;">
      
      <div class="card" style="flex:1; min-width:200px; padding:15px; text-align:center;">
        <h3 style="margin-bottom:8px;">⭐ Average Rating</h3>
        <p style="font-size:1.6rem; font-weight:bold;">
          ${workerSummary.rating?.toFixed(1) || "0.0"}
        </p>
      </div>

      <div class="card" style="flex:1; min-width:200px; padding:15px; text-align:center;">
        <h3 style="margin-bottom:8px;">📝 Total Reviews</h3>
        <p style="font-size:1.6rem; font-weight:bold;">
          ${workerSummary.rating_count}
        </p>
      </div>

    </div>
  `;
}


function renderRatings() {
  let filtered = [...allRatings];

  // Filter by star rating
  const filterVal = filterSelect.value;
  if (filterVal !== "all") {
    filtered = filtered.filter(r => String(r.score) === filterVal);
  }

  // Sort by date
  const sort = sortSelect.value;
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sort === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (filtered.length === 0) {
    list.innerHTML = "<p>No ratings match your filter.</p>";
    return;
  }

  list.innerHTML = "";

  filtered.forEach(r => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.padding = "15px";
    div.style.marginBottom = "10px";
    div.style.border = "1px solid #ddd";
    div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    div.style.borderRadius = "12px";

    div.innerHTML = `
      <p>⭐ ${r.score}</p>
      <p> Feedback: <b>${r.comment || "No comment"}</b></p>
      <p>Request ID: ${r.request_id}</p>
      <div style="font-size:13px;color:var(--muted)">
        by ${r.rater_name} (${new Date(r.created_at).toLocaleString()})
      </div>
    `;

    list.append(div);
  });
}

sortSelect.addEventListener("change", renderRatings);
filterSelect.addEventListener("change", renderRatings);

loadRatings();
