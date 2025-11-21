import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

requireAuth("worker");

const worker = getUser();

// Elements
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const skillEl = document.getElementById("skill");
const profileImg = document.getElementById("profileImg");
const uidEl = document.getElementById("uid");
const createdAtEl = document.getElementById("created_at");

// Modal elements
const imgModal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.querySelector(".img-modal-close");

// Load profile
async function loadProfile() {
  try {
    const res = await apiFetch(ENDPOINTS.WORKERS.GET_PROFILE(worker.id));
    const data = res.data;

    nameEl.textContent = data.name;
    emailEl.textContent = data.email;
    phoneEl.textContent = data.phone || "Not set";
    skillEl.textContent = data.skill_category || "Not set";
    uidEl.textContent = worker.id;

    createdAtEl.textContent = data.created_at
      ? new Date(data.created_at).toLocaleString()
      : "Unknown";

    if (data.profilePic) {
      profileImg.src = data.profilePic;
    }

  } catch (err) {
    toast.error("Failed to load worker profile");
  }
}

loadProfile();

// Image modal
profileImg.addEventListener("click", () => {
  if (profileImg.src.includes("default-avatar.png")) {
    return toast.error("No profile picture found");
  }

  modalImg.src = profileImg.src;
  imgModal.classList.add("show");
});

modalClose.addEventListener("click", () => imgModal.classList.remove("show"));

imgModal.addEventListener("click", (e) => {
  if (e.target === imgModal) imgModal.classList.remove("show");
});

document.getElementById("updateBtn").addEventListener("click", () => {
  window.location.href = "/pages/worker/update-profile.html";
});
