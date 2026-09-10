import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { getUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

const user = getUser();

// DOM Elements
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const profileImg = document.getElementById("profileImg");

const modal = document.getElementById("imgModal");
const modalImg = document.getElementById("imgModalContent");
const modalClose = document.getElementById("imgModalClose");

const updateBtn = document.getElementById("updateBtn");

// Load profile
async function loadProfile() {
  try {
    const res = await apiFetch(ENDPOINTS.USER.GET_PROFILE(user.id));
    const data = res.data;

    nameEl.textContent = data.name;
    emailEl.textContent = data.email;

    if (data.profilePic) profileImg.src = data.profilePic;

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
// Close modal
modalClose.addEventListener("click", () => {
  modal.classList.remove("show");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});

// Update button → redirect
updateBtn.addEventListener("click", () => {
  window.location.href = "/pages/user/update-profile.html";
});
