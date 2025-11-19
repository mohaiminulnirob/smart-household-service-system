import { createWorkerRequestCard } from "../../components/workerRequestCard.js";
import { ENDPOINTS } from "../../config/api.js";
import { apiFetch } from "../../utils/api-client.js";
import { currentUser, requireAuth } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";

// Require worker authentication
requireAuth("worker");

// Logged-in worker
const worker = currentUser();
const workerId = worker.id;

// Dashboard DOM
const profileImgEl = document.getElementById("dashProfileImg");
const userNameEl = document.getElementById("dashUserName");

// Load dashboard top info
async function loadWorkerInfo() {
  try {
    const res = await apiFetch(`/workers/profile/${workerId}`);
    const data = res.data;

    userNameEl.textContent = data.name || "Worker";

    if (data.profilePic) {
      profileImgEl.src = data.profilePic; // Base64 from backend
    }
  } catch (err) {
    console.error(err);
  }
}

loadWorkerInfo();


const container = document.getElementById("recentRequests");

/* -------------------- LOAD RECENT REQUESTS -------------------- */
async function loadRecent() {
  try {
    const res = await apiFetch(ENDPOINTS.REQUESTS.WORKER_REQUESTS(workerId));

    if (!Array.isArray(res) || res.length === 0) {
      container.innerHTML = "<p>No assigned work.</p>";
      return;
    }

    container.innerHTML = "";
    res.slice(0, 3).forEach((req) => {
      container.appendChild(createWorkerRequestCard(req));
    });
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

loadRecent();

/* -------------------- AVAILABILITY FORM -------------------- */

const openBtn = document.getElementById("openAvailabilityForm");
const formBox = document.getElementById("availabilityForm");
const submitBtn = document.getElementById("submitAvailability");

// Show/Hide form
openBtn.onclick = () => {
  formBox.style.display = formBox.style.display === "none" ? "block" : "none";
};

// Update availability
submitBtn.onclick = async () => {
  const selected = document.querySelector("input[name='availability']:checked");

  if (!selected) return toast.error("Please select an availability option!");

  try {
    await apiFetch(ENDPOINTS.WORKERS.UPDATE_STATUS(workerId), {
      method: "PUT",
      body: { availability: selected.value },
    });

    toast.success("Availability updated!");
    formBox.style.display = "none";
  } catch (err) {
    toast.error(err.message);
  }
};
