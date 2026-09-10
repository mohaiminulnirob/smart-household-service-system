import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

requireAuth("worker");

const worker = getUser();

// UI elements
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const skillEl = document.getElementById("skill");
const profileImg = document.getElementById("profileImg");
const updateBtn = document.getElementById("updateBtn");

// Modal elements
const imgModal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.querySelector(".img-modal-close");

// LOAD PROFILE
async function loadProfile() {
  try {
    const res = await apiFetch(ENDPOINTS.WORKERS.GET_PROFILE(worker.id));

    const data = res.data;

    nameEl.textContent = data.name;
    emailEl.textContent = data.email;
    phoneEl.textContent = data.phone || "Not set";
    skillEl.textContent = data.skill_category || "Not set";

    // Profile picture
    if (data.profilePic) {
      profileImg.src = data.profilePic;
    }

  } catch (err) {
    toast.error("Failed to load profile");
  }
}

loadProfile();

// OPEN MODAL ON IMAGE CLICK
profileImg.addEventListener("click", () => {
  const isDefaultPic = profileImg.src.includes("default-avatar.png");

  if (isDefaultPic) {
    toast.error("No profile picture found");
    return;
  }

  modalImg.src = profileImg.src;
  imgModal.classList.add("show");
});

// CLOSE MODAL
modalClose.addEventListener("click", () => {
  imgModal.classList.remove("show");
});

// CLOSE MODAL ON BACKDROP CLICK
imgModal.addEventListener("click", (e) => {
  if (e.target === imgModal) {
    imgModal.classList.remove("show");
  }
});

// Redirect to update page
updateBtn.addEventListener("click", () => {
  window.location.href = "/pages/worker/update-profile.html";
});
