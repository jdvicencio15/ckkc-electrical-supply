
import API from "./axios";

const paymentApi = {
  getPayments: async () => {
    const response = await API.get("/payments");
    return response.data;
  },

  getPaymentById: async (id) => {
    const response = await API.get(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await API.post("/payments", paymentData);
    return response.data;
  },

  updatePayment: async (id, paymentData) => {
    const response = await API.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await API.delete(`/payments/${id}`);
    return response.data;
  },
};

export default paymentApi;

