
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5002/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
API.interceptors.request.use(
  (config) => {
    // Browser-only authentication storage.
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    if (status === 401 && typeof window !== "undefined") {
      // Don't redirect when login or registration itself fails.
      const isAuthRequest =
        /\/auth\/(login|register|signup)(?:[/?]|$)/i.test(requestUrl);

      if (!isAuthRequest) {
        const token = window.localStorage.getItem("token");

        // Only clear an existing session when an authenticated request
        // is rejected. Preserve the user's current login/signup form.
        if (token) {
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("user");

          const isAlreadyOnLoginPage =
            window.location.pathname === "/" ||
            window.location.pathname === "/login";

          if (!isAlreadyOnLoginPage) {
            window.location.replace("/");
          }
        }
      }
    }

    if (!error?.response) {
      error.message =
        error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Unable to connect to the server. Check that the backend is running.";
    }

    return Promise.reject(error);
  }
);

export default API;
