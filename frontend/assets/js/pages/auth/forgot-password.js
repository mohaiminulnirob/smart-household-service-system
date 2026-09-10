import { apiFetch } from '../../utils/api-client.js';
import { ENDPOINTS } from '../../config/api.js';
import { toast } from '../../utils/toast.js';
import { bindValidation, validateForm, clearFormErrors } from '../../utils/validation.js';

const form = document.getElementById("forgotForm");
bindValidation(form);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFormErrors(form);
  if (!validateForm(form)) return;

  const email = document.getElementById("email").value.trim();

  try {
    const res = await apiFetch(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      body: { email }
    });

    toast.success("Reset link sent to your email");
  } catch (err) {
    toast.error(err.message || "Failed to send email");
  }
});