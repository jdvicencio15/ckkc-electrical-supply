import dashboardApi from "../api/dashboardApi";

const dashboardService = {
  getSales: async () => {
    const data = await dashboardApi.getSales();
    return data;
  },

  getProducts: async () => {
    const data = await dashboardApi.getProducts();
    return data;
  },

  getTodaySummary: async () => {
    const data = await dashboardApi.getTodaySummary();
    return data;
  },

  getDashboardSummary: async (month) => {
  const data = await dashboardApi.getDashboardSummary(month);
  return data;
  },
  
};

export default dashboardService;