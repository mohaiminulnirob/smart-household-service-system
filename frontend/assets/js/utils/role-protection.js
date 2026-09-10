export function enforceRole(requiredRole) {
    const role = localStorage.getItem("role");

    if (!role) {
        window.location.href = "/pages/auth/login.html";
        return;
    }

    if (role !== requiredRole) {
        window.location.href = "/pages/error/unauthorized.html";
    }
}
