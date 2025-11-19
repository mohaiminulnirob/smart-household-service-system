import { ENDPOINTS } from '../../config/api.js';
import { apiFetch } from '../../utils/api-client.js';
import { toast } from '../../utils/toast.js';
import { isEmail, isRequired, minLength } from '../../utils/validation.js';

const form = document.getElementById('registerUserForm');
const msg = document.getElementById('registerUserMessage');

function showError(input, text) {
  const el = input.parentElement.querySelector('.form-error');
  if (el) { el.style.display = 'block'; el.textContent = text; }
  input.classList.add('error');
}
function clearErrors(form) {
  form.querySelectorAll('.form-error').forEach(e => { e.style.display = 'none'; e.textContent = ''; });
  form.querySelectorAll('.form-control').forEach(i => i.classList.remove('error'));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form);
  msg.textContent = '';

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const password = form.password.value;

  if (!isRequired(name)) {
    showError(form.name, 'Name is required');
    return;
  }
  if (!isEmail(email)) {
    showError(form.email, 'Invalid email');
    return;
  }
  if (!isRequired(phone)) {
  showError(form.phone, "Phone number is required");
  return;
  }
  if (phone.length < 11) {
    showError(form.phone, "Phone number must be at least 10 digits");
    return;
  }
  if (!minLength(password, 6)) {
    showError(form.password, 'Password must be at least 6 characters');
    return;
  }


  try {
    const res = await apiFetch(ENDPOINTS.AUTH.REGISTER_USER, {
      method: 'POST',
      body: { name, email, phone, password },
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