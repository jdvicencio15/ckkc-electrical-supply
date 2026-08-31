
import supplierApi from "../api/supplierApi";

const supplierService = {
  getSuppliers: async () => {
    const data = await supplierApi.getSuppliers();

    return data;
  },

  getSupplierById: async (id) => {
    const data = await supplierApi.getSupplierById(id);

    return data;
  },

  createSupplier: async (supplierData) => {
    const data = await supplierApi.createSupplier(supplierData);

    return data;
  },

  updateSupplier: async (id, supplierData) => {
    const data = await supplierApi.updateSupplier(id, supplierData);

    return data;
  },

  deleteSupplier: async (id) => {
    const data = await supplierApi.deleteSupplier(id);

    return data;
  },
};

export default supplierService;

