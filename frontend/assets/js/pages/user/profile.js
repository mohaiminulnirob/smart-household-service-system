import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { getUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

const user = getUser();

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const profileImg = document.getElementById("profileImg");
const uidEl = document.getElementById("uid");
const createdAtEl = document.getElementById("created_at");
const phoneEl=document.getElementById("phone")

const modal = document.getElementById("imgModal");
const modalImg = document.getElementById("imgModalContent");
const modalClose = document.getElementById("imgModalClose");
const updateBtn = document.getElementById("updateBtn");

// Load profile info
async function loadProfile() {
  try {
    const res = await apiFetch(ENDPOINTS.USER.GET_PROFILE(user.id));
    const data = res.data;

    nameEl.textContent = data.name;
    emailEl.textContent = data.email;
    uidEl.textContent = user.id;
    phoneEl.textContent=user.phone;

    createdAtEl.textContent = data.created_at
      ? new Date(data.created_at).toLocaleString()
      : "Unknown";

    if (data.profilePic) {
      profileImg.src = data.profilePic;
    }
  } catch (err) {
    toast.error("Failed to load profile");
  }
}

loadProfile();

// Image Viewer Modal
profileImg.addEventListener("click", () => {
  if (profileImg.src.includes("default-avatar.png")) {
    toast.error("No profile picture found");
    return;
  }

  modalImg.src = profileImg.src;
  modal.classList.add("show");
});

// Close Modal
modalClose.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});

// Update profile redirects
updateBtn.addEventListener("click", () => {
  window.location.href = "/pages/user/update-profile.html";
});
