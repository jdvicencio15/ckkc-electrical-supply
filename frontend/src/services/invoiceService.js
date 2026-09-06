
import invoiceApi from "../api/invoiceApi";

const invoiceService = {
  getInvoices: async () => {
    return await invoiceApi.getInvoices();
  },

  getInvoiceById: async (id) => {
    return await invoiceApi.getInvoiceById(id);
  },

  createInvoice: async (invoiceData) => {
    return await invoiceApi.createInvoice(invoiceData);
  },

  updateInvoice: async (id, invoiceData) => {
    return await invoiceApi.updateInvoice(id, invoiceData);
  },

  deleteInvoice: async (id) => {
    return await invoiceApi.deleteInvoice(id);
  },
};

export default invoiceService;

