import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { getUser } from "../../utils/storage.js";
import { toast } from "../../utils/toast.js";

const user = getUser();
if (!user) window.location.href = "/pages/auth/login.html";

const form = document.getElementById("changePassForm");
const oldPassword = document.getElementById("oldPassword");
const newPassword = document.getElementById("newPassword");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    oldPassword: oldPassword.value.trim(),
    newPassword: newPassword.value.trim()
  };

  try {
    const res = await apiFetch(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: "PUT",
      body: payload
    });

    toast.success("Password changed successfully!");

    oldPassword.value = "";
    newPassword.value = "";

    setTimeout(() => {
      window.location.href = "/pages/user/profile.html";
    }, 1000);

  } catch (err) {
    toast.error(err.message || "Failed to change password");
  }
});
