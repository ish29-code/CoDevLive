// frontend/utils/axios.js
import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(async (config) => {
    const fbUser = auth.currentUser;

    // Google login
    if (fbUser) {
        const token = await fbUser.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["x-auth-type"] = "firebase";
        return config;
    }

    // Local login
    const dbToken = localStorage.getItem("token");
    if (dbToken) {
        config.headers.Authorization = `Bearer ${dbToken}`;
        config.headers["x-auth-type"] = "jwt";
    }

    return config;
});

export default api;
