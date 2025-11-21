import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser, saveUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

requireAuth("admin");

// DOM
const form = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

// Load existing admin profile
async function loadProfile() {
  try {
    const res = await apiFetch(ENDPOINTS.ADMIN.GET_PROFILE);

    if (!res?.data) throw new Error("Unable to load profile.");

    nameInput.value = res.data.name;
    phoneInput.value = res.data.phone || "";

  } catch (err) {
    toast.error(err.message);
  }
}

loadProfile();

// Handle update
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
  };

  try {
    await apiFetch(ENDPOINTS.ADMIN.UPDATE_PROFILE, {
      method: "PUT",
      body: payload,
    });

    // Update local storage
    const user = getUser();
    user.name = payload.name;
    user.phone = payload.phone;
    saveUser(user);

    toast.success("Profile updated successfully!");

  } catch (err) {
    toast.error(err.message);
  }
});
