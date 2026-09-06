import API from "./axios";

const reportsApi = {
  getReportSummary: async (params = {}) => {
    const response = await API.get("/reports/summary", {
      params,
    });

    return response.data;
  },

  getSalesReport: async (params = {}) => {
    const response = await API.get("/reports/sales", {
      params,
    });

    return response.data;
    },

getPurchasesReport: async (params = {}) => {
  const response = await API.get("/reports/purchases", {
    params,
  });

  return response.data;
},

getInventoryReport: async () => {
  const response = await API.get("/reports/inventory");

  return response.data;
    },

    getExpenseReport: async (params = {}) => {
    const response = await API.get("/reports/expenses", { params });
    return response.data;
    },
    

};

export default reportsApi;