import supplierPricingApi from "../api/supplierPricingApi";

const supplierPricingService = {
  getSupplierPricings: async () => {
    return supplierPricingApi.getSupplierPricings();
  },

  getSupplierPricingById: async (id) => {
    return supplierPricingApi.getSupplierPricingById(id);
  },

  createSupplierPricing: async (data) => {
    return supplierPricingApi.createSupplierPricing(data);
  },

  updateSupplierPricing: async (id, data) => {
    return supplierPricingApi.updateSupplierPricing(id, data);
  },

  deleteSupplierPricing: async (id) => {
    return supplierPricingApi.deleteSupplierPricing(id);
  },
};

export default supplierPricingService;