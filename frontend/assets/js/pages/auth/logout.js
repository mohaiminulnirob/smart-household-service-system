import { clearAuth } from "../../utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    clearAuth();
    window.location.href = "/index.html";
});
