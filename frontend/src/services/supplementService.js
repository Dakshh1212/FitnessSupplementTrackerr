import API from "./api";

export const getSupplements = async () => {
  const res = await API.get("/supplements");
  return res.data?.data || [];
};

export const createPlan = async (data) => {
  const res = await API.post("/supplements/plans", data);
  return res.data;
};

export const getPlans = async () => {
  const res = await API.get("/supplements/plans");
  return res.data?.data || [];
};