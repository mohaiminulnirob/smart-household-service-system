import { ENDPOINTS } from '../../config/api.js';
import { CATEGORIES } from '../../config/categories.js';
import { apiFetch } from '../../utils/api-client.js';
import { toast } from '../../utils/toast.js';
import { bindValidation, validateForm, clearFormErrors } from '../../utils/validation.js';

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

bindValidation(form);

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
  clearFormErrors(form);
  msg.textContent = '';
  resendBtn.style.display = 'none';

  if (!validateForm(form)) return;

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const skill_category = form.skill_category.value.trim();
  const location = form.location.value.trim();
  const latitude = form.latitude.value.trim() || null;
  const longitude = form.longitude.value.trim() || null;

  try {
    const payload = { name, email, password, skill_category, location, latitude, longitude };

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


    setTimeout(() => location.href = '/pages/auth/login.html', 1600);
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
