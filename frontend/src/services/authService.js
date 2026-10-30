
import API from "./api";

/* =========================
   AUTH HELPERS
========================= */

const saveSession = (data) => {
  if (!data?.token || !data?.user) {
    throw new Error("The server returned an invalid authentication response.");
  }

  try {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    throw new Error(
      "Unable to save your login session. Check your browser settings."
    );
  }

  return data;
};

const updateCachedUser = (user) => {
  if (!user || typeof user !== "object") return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    localStorage.setItem(
      "user",
      JSON.stringify({ ...currentUser, ...user })
    );
  } catch {
    // The API request can succeed even if local storage is unavailable.
  }
};

/* =========================
   LOGIN
========================= */

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", {
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });

  return saveSession(response.data);
};

/* =========================
   REGISTER
========================= */

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });

  return saveSession(response.data);
};

/* =========================
   LOGOUT
========================= */

export const logoutUser = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } finally {
    window.location.replace("/");
  }
};

/* =========================
   CURRENT USER
========================= */

export const getMe = async () => {
  const response = await API.get("/auth/me");

  if (response.data?.user) {
    updateCachedUser(response.data.user);
  }

  return response.data;
};

/* =========================
   UPDATE PROFILE
========================= */

export const updateProfile = async (data) => {
  const response = await API.put("/auth/update", data);

  if (response.data?.user) {
    updateCachedUser(response.data.user);
  }

  return response.data;
};

/* =========================
   COMPLETE ONBOARDING
========================= */

export const completeOnboarding = async (data) => {
  const response = await API.post("/auth/onboarding", data);

  if (response.data?.user) {
    updateCachedUser(response.data.user);
  }

  return response.data;
};
