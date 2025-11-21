import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { getUser, saveUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

requireAuth("user");

const user = getUser();

// Form elements
const form = document.getElementById("updateForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const picInput = document.getElementById("profilePic");

// The submit button (first button inside the form)
const saveBtn = form.querySelector("button[type='submit']");

// Load current profile data
async function loadCurrent() {
  try {
    const res = await apiFetch(ENDPOINTS.USER.GET_PROFILE(user.id));
    const data = res.data;

    nameInput.value = data.name || "";
    phoneInput.value = data.phone || "";

  } catch (err) {
    toast.error("Unable to load profile");
  }
}

loadCurrent();

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const formData = new FormData();
  formData.append("name", nameInput.value);
  formData.append("phone", phoneInput.value);

  if (picInput.files.length > 0) {
    formData.append("profilePic", picInput.files[0]);
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api${ENDPOINTS.USER.UPDATE_PROFILE(user.id)}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("fixmate_token"),
        },
        body: formData,
      }
    );

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    // Update user in local storage
    user.name = nameInput.value;
    user.phone = phoneInput.value;
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
