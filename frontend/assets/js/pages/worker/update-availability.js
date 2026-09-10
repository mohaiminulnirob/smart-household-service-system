import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { currentUser, requireAuth } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";

requireAuth("worker");

const worker = currentUser();
const form = document.getElementById("availForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selected = document.querySelector("input[name='availability']:checked");
  if (!selected) {
    toast.error("Please select an availability option");
    return;
  }

  try {
    const data = await apiFetch(ENDPOINTS.WORKERS.UPDATE_STATUS(worker.id), {
      method: "PUT",
      body: { availability: selected.value },
    });

    toast.success("Availability updated!");
    message.textContent = data.message || "Updated successfully!";
  } catch (err) {
    toast.error(err.message);
    message.textContent = err.message;
  }
});
