import { API_BASE_URL, ENDPOINTS } from "../../config/api.js";
import { CATEGORIES } from "../../config/categories.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser, saveUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";
import { bindValidation, validateForm, clearFormErrors } from "../../utils/validation.js";

requireAuth("worker");

const worker = getUser();

// UI elements
const form = document.getElementById("updateForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const skillInput = document.getElementById("skill_category");
const picInput = document.getElementById("profilePic");
const saveBtn = document.getElementById("saveBtn");

// Populate dropdown
CATEGORIES.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  skillInput.appendChild(opt);
});

// LOAD CURRENT DETAILS INTO FORM
async function loadCurrent() {
  try {
    const res = await apiFetch(ENDPOINTS.WORKERS.GET_PROFILE(worker.id));

    const data = res.data;

    nameInput.value = data.name;
    phoneInput.value = data.phone || "";
    skillInput.value = data.skill_category || "";

  } catch (err) {
    toast.error("Unable to load profile");
  }
}

loadCurrent();

bindValidation(form);

// SUBMIT UPDATE
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFormErrors(form);
  if (!validateForm(form)) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const formData = new FormData();
  formData.append("name", nameInput.value);
  formData.append("phone", phoneInput.value);
  formData.append("skill_category", skillInput.value);

  if (picInput.files.length > 0) {
    formData.append("profilePic", picInput.files[0]);
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}${ENDPOINTS.WORKERS.UPDATE_PROFILE(worker.id)}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("fixmate_token"),
        },
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // update local user
    worker.name = nameInput.value;
    saveUser(worker);

    toast.success("Profile updated!");

    setTimeout(() => {
      window.location.href = "/pages/worker/profile.html";
    }, 800);

  } catch (err) {
    toast.error(err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";
  }
});
