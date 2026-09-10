import { skeletonCard, emptyState } from "../../components/skeletonCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { currentUser, requireAuth } from "../../utils/auth.js";

requireAuth("worker"); // ensures only worker can enter

// Get worker info
const worker = currentUser();

const summary = document.getElementById("summary");
const list = document.getElementById("ratingsContainer");

async function loadRatings() {
  summary.innerHTML = "";
  summary.appendChild(skeletonCard('summary', 1));
  list.innerHTML = "";
  list.appendChild(skeletonCard('rating', 3));

  try {
    const res = await apiFetch(
      ENDPOINTS.RATINGS.GET_WORKER_RATINGS(worker.id)
    );

    const workerSummary = res.worker;
    const ratings = res.ratings || [];

    summary.innerHTML = "";
    summary.appendChild(createSummaryCard(workerSummary));

    list.innerHTML = "";

    if (!ratings.length) {
      list.appendChild(emptyState('rating'));
      return;
    }

    ratings.forEach(r => {
      const div = document.createElement("div");
      div.className = "card p-md mb-md";

      div.innerHTML = `
        <p>⭐ ${r.score}</p>
        <p>${r.comment || "No comment"}</p>
        <div class="text-muted" style="font-size:13px">
          by ${r.rater_name} (${new Date(r.created_at).toLocaleString()})
        </div>
      `;

      list.append(div);
    });

  } catch (err) {
    summary.innerHTML = `<p style="color:red">${err.message}</p>`;
    list.innerHTML = "";
  }
}

function createSummaryCard(workerSummary) {
  const div = document.createElement("div");
  div.className = "card p-md";
  div.innerHTML = `
    <h3>${workerSummary.name}</h3>
    <p>⭐ Rating: <b>${(Number(workerSummary.rating) || 0).toFixed(1)}</b></p>
    <p>Total Reviews: ${workerSummary.rating_count}</p>
  `;
  return div;
}

loadRatings();
