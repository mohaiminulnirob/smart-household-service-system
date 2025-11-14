// Auto redirect based on role if already logged in
const token = localStorage.getItem("token");
const role   = localStorage.getItem("role");

if (token && role) {
    if (location.pathname.includes("index.html") || location.pathname === "/") {
        if (role === "user") window.location.href = "./pages/user/dashboard.html";
        if (role === "worker") window.location.href = "./pages/worker/dashboard.html";
        if (role === "admin")  window.location.href = "./pages/admin/dashboard.html";
    }
}

fetch("http://localhost:5000/")
    .then(res => res.json())
    .then(data => console.log("Backend Response:", data))
    .catch(err => console.error("Connection Error:", err));
