import API from "./axios";

const supplierPricingApi = {
  getSupplierPricings: async () => {
    const response = await API.get("/supplier-pricing");

    return response.data;
  },

  getSupplierPricingById: async (id) => {
    const response = await API.get(`/supplier-pricing/${id}`);

    return response.data;
  },

  createSupplierPricing: async (data) => {
    const response = await API.post("/supplier-pricing", data);

    return response.data;
  },

  updateSupplierPricing: async (id, data) => {
    const response = await API.put(`/supplier-pricing/${id}`, data);

    return response.data;
  },

  deleteSupplierPricing: async (id) => {
    const response = await API.delete(`/supplier-pricing/${id}`);

    return response.data;
  },
};

export default supplierPricingApi;