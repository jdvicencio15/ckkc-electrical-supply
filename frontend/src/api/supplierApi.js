
import API from "./axios";

const supplierApi = {
  getSuppliers: async () => {
    const response = await API.get("/suppliers");

    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await API.get(`/suppliers/${id}`);

    return response.data;
  },

  createSupplier: async (supplierData) => {
    const response = await API.post("/suppliers", supplierData);

    return response.data;
  },

  updateSupplier: async (id, supplierData) => {
    const response = await API.put(`/suppliers/${id}`, supplierData);

    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await API.delete(`/suppliers/${id}`);

    return response.data;
  },
};

export default supplierApi;
