import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5002/api"
});

/* =========================
   🔐 REQUEST INTERCEPTOR
========================= */
API.interceptors.request.use(

  (req) => {

    const token =
      localStorage.getItem("token");

    if (token) {

      req.headers.Authorization =
        `Bearer ${token}`;

    }

    return req;

  },

  (error) => {

    return Promise.reject(error);

  }

);

/* =========================
   🚨 RESPONSE INTERCEPTOR
========================= */
API.interceptors.response.use(

  (res) => {

    return res;

  },

  (error) => {

    const status =
      error.response?.status;

    // 🔒 UNAUTHORIZED
    if (status === 401) {

      console.log(
        "Session expired 🔒"
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href = "/";

    }

    // ❌ SERVER ERROR
    if (status === 500) {

      console.log(
        "Server error ❌"
      );

    }

    // ❌ NOT FOUND
    if (status === 404) {

      console.log(
        "API route not found ❌"
      );

    }

    return Promise.reject(error);

  }

);

export default API;