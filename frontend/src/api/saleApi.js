import API from "./axios";

const saleApi = {
  getSales: async () => {
    const response = await API.get("/sales");

    return response.data;
  },

  getSaleById: async (id) => {
    const response = await API.get(`/sales/${id}`);

    return response.data;
  },

  createSale: async (saleData) => {
    const response = await API.post("/sales", saleData);

    return response.data;
  },

  updateSale: async (id, saleData) => {
    const response = await API.put(`/sales/${id}`, saleData);

    return response.data;
  },

  deleteSale: async (id) => {
    const response = await API.delete(`/sales/${id}`);

    return response.data;
  },

  releaseSale: async (id) => {
    const response = await API.post(`/sales/${id}/release`);

    return response.data;
  },
};

export default saleApi;