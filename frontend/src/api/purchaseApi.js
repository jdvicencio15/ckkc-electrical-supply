import API from "./axios";

const purchaseApi = {
  getPurchases: async () => {
    const response = await API.get("/purchases");

    return response.data;
  },

  getPurchaseById: async (id) => {
    const response = await API.get(`/purchases/${id}`);

    return response.data;
  },

  createPurchase: async (purchaseData) => {
    const response = await API.post("/purchases", purchaseData);

    return response.data;
  },

  updatePurchase: async (id, purchaseData) => {
    const response = await API.put(`/purchases/${id}`, purchaseData);

    return response.data;
  },

  deletePurchase: async (id) => {
    const response = await API.delete(`/purchases/${id}`);

    return response.data;
    },

 receivePurchase: async (id) => {
  const response = await API.post(`/purchases/${id}/receive`);

  return response.data;
},

};

export default purchaseApi;