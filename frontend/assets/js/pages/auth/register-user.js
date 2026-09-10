import { ENDPOINTS } from '../../config/api.js';
import { apiFetch } from '../../utils/api-client.js';
import { toast } from '../../utils/toast.js';
import { bindValidation, validateForm, clearFormErrors } from '../../utils/validation.js';

const form = document.getElementById('registerUserForm');
const msg = document.getElementById('registerUserMessage');

bindValidation(form);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(form);
  msg.textContent = '';

  if (!validateForm(form)) return;

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await apiFetch(ENDPOINTS.AUTH.REGISTER_USER, {
      method: 'POST',
      body: { name, email, password },
      timeout: 15000,
    });

    // success message expected
    const message = (res && (res.message || res.msg)) || 'Registered successfully. Check email for verification.';
    toast.success(message);
    msg.textContent = message;

    // redirect to login after short delay
    setTimeout(() => location.href = '/pages/auth/login.html', 1600);
  } catch (err) {
    toast.error(err.message || 'Register failed');
    msg.textContent = err.message || 'Register failed';
  }
});