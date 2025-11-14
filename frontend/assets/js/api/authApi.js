import { BASE_URL } from "./config.js";
import { http } from "../utils/http.js";

export const AuthAPI = {
    login: (data) => http(`${BASE_URL}/auth/login`, "POST", data),
    registerUser: (data) => http(`${BASE_URL}/auth/register/user`, "POST", data),
    registerWorker: (data) => http(`${BASE_URL}/auth/register/worker`, "POST", data),
    logout: () => http(`${BASE_URL}/auth/logout`, "POST", null, true),
};
