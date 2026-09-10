import { API_BASE_URL, ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser, saveUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";
import { bindValidation, validateForm, clearFormErrors } from "../../utils/validation.js";

requireAuth("user");

const user = getUser();

// Form elements
const form = document.getElementById("updateForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const picInput = document.getElementById("profilePic");
const saveBtn = document.getElementById("saveBtn");

// Load existing profile
async function loadCurrent() {
  try {
    const res = await apiFetch(ENDPOINTS.USER.GET_PROFILE(user.id));
    const data = res.data;

    nameInput.value = data.name;
    emailInput.value = data.email;

  } catch (err) {
    toast.error("Unable to load profile");
  }
}

loadCurrent();

bindValidation(form);

// Update submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFormErrors(form);
  if (!validateForm(form)) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const formData = new FormData();
  formData.append("name", nameInput.value);
  formData.append("email", emailInput.value);

  if (picInput.files.length > 0) {
    formData.append("profilePic", picInput.files[0]);
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}${ENDPOINTS.USER.UPDATE_PROFILE(user.id)}`,
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

    // Update local user
    user.name = nameInput.value;
    user.email = emailInput.value;
    saveUser(user);

    toast.success("Profile updated!");

    setTimeout(() => {
      window.location.href = "/pages/user/profile.html";
    }, 800);

  } catch (err) {
    toast.error(err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";
  }
});
