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
};

export default supplierPricingApi;