import API from "./api";

/* =========================
   🔑 AUTH
========================= */

// ✅ LOGIN
export const loginUser = async (data) => {

  const res = await API.post(
    "/auth/login",
    data
  );

  // 🔥 SAVE TOKEN
  if (res.data?.token) {

    localStorage.setItem(
      "token",
      res.data.token
    );

  }

  // 🔥 SAVE USER
  if (res.data?.user) {

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

  }

  return res.data;

};

// ✅ REGISTER
export const registerUser = async (data) => {

  const res = await API.post(
    "/auth/register",
    data
  );

  // 🔥 SAVE TOKEN
  if (res.data?.token) {

    localStorage.setItem(
      "token",
      res.data.token
    );

  }

  // 🔥 SAVE USER
  if (res.data?.user) {

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

  }

  return res.data;

};

// ✅ LOGOUT
export const logoutUser = () => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );

  window.location.href = "/";

};

/* =========================
   👤 USER
========================= */

// ✅ GET CURRENT USER
export const getMe = async () => {

  const res = await API.get(
    "/auth/me"
  );

  return res.data;

};

// ✅ UPDATE PROFILE
export const updateProfile =
  async (data) => {

    const res = await API.put(
      "/auth/update",
      data
    );

    // 🔥 UPDATE LOCAL USER
    if (res.data?.user) {

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

    }

    return res.data;

  };

/* =========================
   🚀 ONBOARDING
========================= */

// ✅ COMPLETE ONBOARDING
export const completeOnboarding =
  async (data) => {

    const res = await API.post(
      "/auth/onboarding",
      data
    );

    // 🔥 UPDATE USER
    if (res.data?.user) {

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

    }

    return res.data;

  };