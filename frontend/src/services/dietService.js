import API from "./api";

export const getFoods = async () => {
  const res = await API.get("/diet/foods");
  return res.data?.data || [];
};

export const addDietEntry = async (data) => {
  const res = await API.post("/diet/entries", data);
  return res.data;
};

export const getDietEntries = async () => {
  const res = await API.get("/diet/entries");
  return res.data?.data || [];
};