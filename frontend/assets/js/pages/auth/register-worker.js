import { ENDPOINTS } from '../../config/api.js';
import { CATEGORIES } from '../../config/categories.js';
import { apiFetch } from '../../utils/api-client.js';
import { toast } from '../../utils/toast.js';
import { isEmail, isRequired, minLength } from '../../utils/validation.js';

const form = document.getElementById('registerWorkerForm');
const geoBtn = document.getElementById('geoBtn');
const msg = document.getElementById('registerWorkerMessage');
const resendBtn = document.getElementById('resendVerifyBtn');

const skillSelect = document.getElementById("skillCategorySelect");

// Populate dropdown from shared categories
CATEGORIES.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  skillSelect.appendChild(opt);
});

function showError(input, text) {
  const el = input.parentElement.querySelector('.form-error');
  if (el) { el.style.display = 'block'; el.textContent = text; }
  input.classList.add('error');
}

function clearErrors(form) {
  form.querySelectorAll('.form-error').forEach(e => {
    e.style.display = 'none'; e.textContent = '';
  });
  form.querySelectorAll('.form-control').forEach(i => i.classList.remove('error'));
}

// GPS
geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return toast.error("Geolocation not supported");

  geoBtn.disabled = true;
  geoBtn.textContent = "Locating...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      form.latitude.value = pos.coords.latitude;
      form.longitude.value = pos.coords.longitude;
      geoBtn.textContent = "Use GPS";
      geoBtn.disabled = false;
      toast.success("Location filled");
    },
    () => {
      geoBtn.textContent = "Use GPS";
      geoBtn.disabled = false;
      toast.error("Unable to get location");
    },
    { timeout: 10000 }
  );
});

// Form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form);
  msg.textContent = '';
  resendBtn.style.display = 'none';

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const password = form.password.value;
  const skill_category = form.skill_category.value.trim();
  const locationText = form.location.value.trim();
  const latitude = form.latitude.value.trim() || null;
  const longitude = form.longitude.value.trim() || null;

  if (!isRequired(name)) return showError(form.name, 'Name is required');
  if (!isEmail(email)) return showError(form.email, 'Invalid email');
  if (!isRequired(phone)) return showError(form.phone, 'Phone Number is required');
  if (!minLength(phone, 11)) return showError(form.phone, 'Phone Number must be at least 11 chars');
  if (!minLength(password, 6)) return showError(form.password, 'Password must be at least 6 chars');
  if (!isRequired(skill_category)) return showError(form.skill_category, 'Skill category required');

  try {
    const payload = {
      name,
      email,
      phone,
      password,
      skill_category,
      location: locationText,
      latitude,
      longitude
    };

    const res = await apiFetch(ENDPOINTS.AUTH.REGISTER_WORKER, {
      method: 'POST',
      body: payload
    });

    const message = res?.message || 'Worker registered successfully. Verify email & wait admin approval.';
    toast.success(message);
    msg.textContent = message;

    // SHOW RESEND EMAIL BUTTON
    resendBtn.style.display = 'inline-block';
    resendBtn.dataset.email = email;


    setTimeout(() => location.href = '/pages/auth/login.html', 16000);
  } catch (err) {
    toast.error(err.message || 'Registration failed');
    msg.textContent = err.message || 'Registration failed';
  }
});

// RESEND VERIFICATION EMAIL
resendBtn.addEventListener('click', async () => {
  const email = resendBtn.dataset.email;
  if (!email) return toast.error("Email not found");

  try {
    const res = await apiFetch(ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: "POST",
      body: { email }
    });

    toast.success("Verification email sent again!");
  } catch (err) {
    toast.error(err.message || "Failed to resend email");
  }
});
