
import paymentApi from "../api/paymentApi";

const paymentService = {
  getPayments: async () => {
    const data = await paymentApi.getPayments();
    return data;
  },

  getPaymentById: async (id) => {
    const data = await paymentApi.getPaymentById(id);
    return data;
  },

  createPayment: async (paymentData) => {
    const data = await paymentApi.createPayment(paymentData);
    return data;
  },

  updatePayment: async (id, paymentData) => {
    const data = await paymentApi.updatePayment(id, paymentData);
    return data;
  },

  deletePayment: async (id) => {
    const data = await paymentApi.deletePayment(id);
    return data;
  },
};

export default paymentService;
