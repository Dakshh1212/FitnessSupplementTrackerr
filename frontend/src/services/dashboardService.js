import API from "./api";

/* =========================
   📊 DASHBOARD
========================= */

// ✅ GET DASHBOARD DATA
export const getDashboardData =
  async () => {

    const res = await API.get(
      "/dashboard"
    );

    return res.data;

  };