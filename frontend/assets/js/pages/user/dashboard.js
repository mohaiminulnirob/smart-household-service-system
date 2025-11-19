import { createRequestCard } from '../../components/requestCard.js';
import { ENDPOINTS } from '../../config/api.js';
import { apiFetch } from '../../utils/api-client.js';
import { currentUser, requireAuth } from '../../utils/auth.js';

requireAuth('user');

const user = currentUser();
const userId = user.id;

// Dashboard DOM
const profileImgEl = document.getElementById("dashProfileImg");
const userNameEl = document.getElementById("dashUserName");
const recentContainer = document.getElementById("recentRequests");

// Load dashboard top info
async function loadUserInfo() {
  try {
    const res = await apiFetch(`/users/profile/${userId}`);
    const data = res.data;

    userNameEl.textContent = data.name || "User";

    if (data.profilePic) {
      profileImgEl.src = data.profilePic; // Base64 from backend
    }
  } catch (err) {
    console.error(err);
  }
}

loadUserInfo();

async function loadRecent() {
  try {
    // Correct endpoint with user ID
    const res = await apiFetch(
      ENDPOINTS.REQUESTS.USER_REQUESTS(userId)
    );

    // Backend returns array, not res.data
    if (!Array.isArray(res) || res.length === 0) {
      recentContainer.innerHTML = "<p>No recent requests found.</p>";
      return;
    }

    recentContainer.innerHTML = "";

    res.slice(0, 3).forEach(req => {
      recentContainer.appendChild(createRequestCard(req));
    });

  } catch (err) {
    recentContainer.innerHTML = `<p>Error loading requests: ${err.message}</p>`;
  }
}

loadRecent();
