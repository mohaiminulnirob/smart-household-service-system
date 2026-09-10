import { apiFetch } from "../../utils/api-client.js";
import { ENDPOINTS } from "../../config/api.js";
import { toast } from "../../utils/toast.js";
import { requireAuth } from "../../utils/auth.js";
import { bindValidation, validateForm, clearFormErrors } from "../../utils/validation.js";

requireAuth("worker");

const form = document.getElementById("locForm");
const gpsBtn = document.getElementById("gpsBtn");
const message = document.getElementById("message");

bindValidation(form);

gpsBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    toast.error("GPS not supported");
    return;
  }

  gpsBtn.disabled = true;
  gpsBtn.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      form.latitude.value = pos.coords.latitude;
      form.longitude.value = pos.coords.longitude;
      toast.success("GPS location set");
      gpsBtn.disabled = false;
      gpsBtn.textContent = "Use GPS";
    },
    () => {
      toast.error("Failed to get GPS");
      gpsBtn.disabled = false;
      gpsBtn.textContent = "Use GPS";
    }
  );
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFormErrors(form);
  if (!validateForm(form)) return;

  const latitude = form.latitude.value.trim();
  const longitude = form.longitude.value.trim();

  try {
    await apiFetch(ENDPOINTS.WORKERS.UPDATE_LOCATION, {
      method: "PUT",
      body: { latitude, longitude }
    });

    toast.success("Location updated");
    message.textContent = "Updated successfully!";
  } catch (err) {
    toast.error(err.message);
    message.textContent = err.message;
  }
});
