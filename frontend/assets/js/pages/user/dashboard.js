import { createRequestCard } from '../../components/requestCard.js';
import { skeletonCard, emptyState } from '../../components/skeletonCard.js';
import { ENDPOINTS } from '../../config/api.js';
import { apiFetch } from '../../utils/api-client.js';
import { currentUser, requireAuth } from '../../utils/auth.js';

requireAuth('user');

const user = currentUser();
const userId = user.id;

const recentContainer = document.getElementById("recentRequests");

let isLoading = true;

async function loadRecent() {
  isLoading = true;
  recentContainer.innerHTML = '';
  recentContainer.appendChild(skeletonCard('request', 3));

  try {
    const res = await apiFetch(
      ENDPOINTS.REQUESTS.USER_REQUESTS(userId)
    );

    isLoading = false;
    recentContainer.innerHTML = "";

    if (!Array.isArray(res) || res.length === 0) {
      recentContainer.appendChild(emptyState('request', 'No recent requests found. Create your first service request!'));
      return;
    }

    res.slice(0, 3).forEach(req => {
      recentContainer.appendChild(createRequestCard(req));
    });

  } catch (err) {
    isLoading = false;
    recentContainer.innerHTML = `<p>Error loading requests: ${err.message}</p>`;
  }
}

loadRecent();
