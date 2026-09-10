import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { applyLogin } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";
import { bindValidation, validateForm, clearFormErrors } from "../../utils/validation.js";

const form = document.getElementById("loginForm");
const msgEl = document.getElementById("loginMessage");
const roleSelect = document.getElementById("role");

// Parse URL parameter (?as=admin)
const params = new URLSearchParams(window.location.search);
const forceAdmin = params.get("as") === "admin";

// Wire blur validation
bindValidation(form);

// Fill dropdown
if (forceAdmin) {
  roleSelect.innerHTML = `<option value="admin" selected>Admin</option>`;
  roleSelect.disabled = true;
} else {
  roleSelect.innerHTML = `
    <option value="user">User</option>
    <option value="worker">Worker</option>
  `;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormErrors(form);
  msgEl.textContent = "";

  if (!validateForm(form)) return;

  const email = form.email.value.trim();
  const password = form.password.value;
  const role = roleSelect.value.trim();

  try {
    const data = await apiFetch(ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: { email, password, role },
    });


    const token = data.token;
    const user = data.user;

    if (!token || !user) {
      toast.error("Login failed");
      msgEl.textContent = "Login failed";
      return;
    }

    applyLogin(token, user);
    toast.success("Login successful");

    if (role === "admin") window.location.href = "/pages/admin/dashboard.html";
    else if (role === "worker") window.location.href = "/pages/worker/dashboard.html";
    else window.location.href = "/pages/user/dashboard.html";
  } catch (err) {
    toast.error(err.message);
    msgEl.textContent = err.message;
  }
});
