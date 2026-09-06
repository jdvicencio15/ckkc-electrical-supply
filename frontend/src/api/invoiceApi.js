
import API from "./axios";

const invoiceApi = {
  getInvoices: async () => {
    const response = await API.get("/invoices");

    return response.data;
  },

  getInvoiceById: async (id) => {
    const response = await API.get(`/invoices/${id}`);

    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await API.post("/invoices", invoiceData);

    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await API.put(`/invoices/${id}`, invoiceData);

    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await API.delete(`/invoices/${id}`);

    return response.data;
  },
};

export default invoiceApi;

