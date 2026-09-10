import renderNavbarInto from "../../components/navbar.js";
import { apiFetch } from "../../utils/api-client.js";
import { getUser, saveUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";
import { requireAuth } from "../../utils/auth.js";
import { bindValidation, validateForm, clearFormErrors } from "../../utils/validation.js";
import { ENDPOINTS } from "../../config/api.js";

// Only allow admin
requireAuth("admin");

renderNavbarInto("navbar-dynamic");

// DOM elements
const profileForm = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");

// Load profile
async function loadProfile() {
  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.GET_PROFILE);

    if (!res || !res.data) throw new Error("Unable to load profile.");

    nameInput.value = res.data.name;
    emailInput.value = res.data.email;

  } catch (err) {
    toast.error(err.message);
  }
}

loadProfile();

bindValidation(profileForm);

// Submit
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFormErrors(profileForm);
  if (!validateForm(profileForm)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Updating...";

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passInput.value.trim() || null,
  };

  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.UPDATE_PROFILE, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (res.error) throw new Error(res.error);

    // Update local storage
    const user = getUser();
    user.name = payload.name;
    user.email = payload.email;
    saveUser(user);

    toast.success("Profile updated successfully!");
    passInput.value = "";

  } catch (err) {
    toast.error(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Update Profile";
  }
});
