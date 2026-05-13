import API from "./api";

/* =========================
   🏋️ WORKOUT SERVICE FIXED
========================= */

export const getExercises = async () => {
  const res = await API.get("/workouts/exercises");
  return res.data?.data || [];
};

export const createSession = async (data) => {
  const res = await API.post("/workouts/sessions", data);
  return res.data;
};

export const getSessions = async () => {
  const res = await API.get("/workouts/sessions");
  return res.data?.data || [];
};

export const deleteSession = async (id) => {
  const res = await API.delete(`/workouts/sessions/${id}`);
  return res.data;
};