import supplierPricingApi from "../api/supplierPricingApi";

const supplierPricingService = {
  getSupplierPricings: async () => {
    return supplierPricingApi.getSupplierPricings();
  },

  getSupplierPricingById: async (id) => {
    return supplierPricingApi.getSupplierPricingById(id);
  },
};

export default supplierPricingService;