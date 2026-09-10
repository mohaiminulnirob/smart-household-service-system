import { apiFetch } from '../../utils/api-client.js';
import { ENDPOINTS } from '../../config/api.js';
import { toast } from '../../utils/toast.js';
import { bindValidation, validateForm, clearFormErrors } from '../../utils/validation.js';

// get ?token=xyz
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) {
  toast.error("Invalid reset link");
}

const form = document.getElementById("resetForm");
bindValidation(form);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFormErrors(form);
  if (!validateForm(form)) return;

  const newPassword = document.getElementById("newPassword").value.trim();

  try {
    await apiFetch(ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: "POST",
      body: { token, newPassword }
    });

    toast.success("Password reset successful");
    setTimeout(() => (window.location.href = "/pages/auth/login.html"), 1000);
  } catch (err) {
    toast.error(err.message || "Failed to reset password");
  }
});