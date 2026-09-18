import supplierPOApi from "../api/supplierPOApi";

const supplierPOService = {
  getSupplierPOs: async () => {
    const data = await supplierPOApi.getSupplierPOs();

    return data;
  },

  getSupplierPOById: async (id) => {
    const data = await supplierPOApi.getSupplierPOById(id);

    return data;
  },

  createSupplierPO: async (supplierPOData) => {
    const data =
      await supplierPOApi.createSupplierPO(supplierPOData);

    return data;
  },

  updateSupplierPO: async (id, supplierPOData) => {
    const data =
      await supplierPOApi.updateSupplierPO(id, supplierPOData);

    return data;
  },

  deleteSupplierPO: async (id) => {
    const data =
      await supplierPOApi.deleteSupplierPO(id);

    return data;
  },

  exportSupplierPOPDF: async (id) => {
    const data =
      await supplierPOApi.exportSupplierPOPDF(id);

    return data;
  },

  releaseSupplierPO: async (id) => {
    const data =
      await supplierPOApi.releaseSupplierPO(id);

    return data;
  },
};

export default supplierPOService;