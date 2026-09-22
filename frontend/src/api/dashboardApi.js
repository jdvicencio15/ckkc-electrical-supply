import API from "./axios";

const dashboardApi = {
  getSales: async () => {
    const response = await API.get("/sales");
    return response.data;
  },

  getProducts: async () => {
    const response = await API.get("/products");
    return response.data;
  },

  getTodaySummary: async () => {
    const response = await API.get("/dashboard/today");
    return response.data;
  },

  getDashboardSummary: async (month) => {
  const response = await API.get(
    `/dashboard/summary?month=${month}`
  );

  return response.data;
  },
  
};

export default dashboardApi;