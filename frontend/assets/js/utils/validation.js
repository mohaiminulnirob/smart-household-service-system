export function isEmail(v) {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isRequired(v) {
  return v !== null && v !== undefined && String(v).trim() !== '';
}

export function minLength(v, n=6) {
  return String(v || '').length >= n;
}

const RULES = {
  email: [
    { test: v => isRequired(v), msg: 'Email is required' },
    { test: v => isEmail(v), msg: 'Please enter a valid email' }
  ],
  password: [
    { test: v => isRequired(v), msg: 'Password is required' },
    { test: v => minLength(v, 6), msg: 'Password must be at least 6 characters' }
  ],
  name: [
    { test: v => isRequired(v), msg: 'Name is required' }
  ],
  category: [
    { test: v => isRequired(v), msg: 'Category is required' }
  ],
  skill_category: [
    { test: v => isRequired(v), msg: 'Skill category is required' }
  ],
  description: [
    { test: v => isRequired(v), msg: 'Description is required' }
  ],
  location: [
    { test: v => isRequired(v), msg: 'Location is required' }
  ],
  latitude: [
    { test: v => isRequired(v), msg: 'Latitude is required' }
  ],
  longitude: [
    { test: v => isRequired(v), msg: 'Longitude is required' }
  ]
};

function showFieldError(input, text) {
  const el = input.parentElement.querySelector('.form-error');
  if (el) {
    el.style.display = 'block';
    el.textContent = text;
  }
  input.classList.add('error');
}

function clearFieldError(input) {
  const el = input.parentElement.querySelector('.form-error');
  if (el) {
    el.style.display = 'none';
    el.textContent = '';
  }
  input.classList.remove('error');
}

function validateField(input) {
  clearFieldError(input);
  const name = input.getAttribute('name') || input.id;
  const rules = RULES[name];
  if (!rules) return true;
  const value = input.value.trim();
  for (const rule of rules) {
    if (!rule.test(value)) {
      showFieldError(input, rule.msg);
      return false;
    }
  }
  return true;
}

export function bindValidation(form) {
  if (!form) return;
  const inputs = form.querySelectorAll('[name], [id]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
}

export function validateForm(form) {
  let valid = true;
  const inputs = form.querySelectorAll('[name], [id]');
  inputs.forEach(input => {
    if (!validateField(input)) valid = false;
  });
  return valid;
}

export function clearFormErrors(form) {
  form.querySelectorAll('.form-error').forEach(e => {
    e.style.display = 'none';
    e.textContent = '';
  });
  form.querySelectorAll('.form-control').forEach(i => i.classList.remove('error'));
}
