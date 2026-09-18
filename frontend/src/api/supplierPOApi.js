import API from "./axios";

const supplierPOApi = {
  getSupplierPOs: async () => {
    const response = await API.get("/supplier-pos");

    return response.data;
  },

  getSupplierPOById: async (id) => {
    const response = await API.get(`/supplier-pos/${id}`);

    return response.data;
  },

  createSupplierPO: async (supplierPOData) => {
    const response = await API.post(
      "/supplier-pos",
      supplierPOData,
    );

    return response.data;
  },

  updateSupplierPO: async (id, supplierPOData) => {
    const response = await API.put(
      `/supplier-pos/${id}`,
      supplierPOData,
    );

    return response.data;
  },

  deleteSupplierPO: async (id) => {
    const response = await API.delete(
      `/supplier-pos/${id}`,
    );

    return response.data;
  },

  exportSupplierPOPDF: async (id) => {
    const response = await API.get(
      `/supplier-pos/${id}/pdf`,
      {
        responseType: "blob",
      },
    );

    return response.data;
  },

 releaseSupplierPO: async (id) => {
  const response = await API.post(
    `/supplier-pos/${id}/release`,
  );

  return response.data;
},
};

export default supplierPOApi;