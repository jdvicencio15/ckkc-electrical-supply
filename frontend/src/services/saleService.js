import saleApi from "../api/saleApi";

const saleService = {
  getSales: async () => {
    return saleApi.getSales();
  },

  getSaleById: async (id) => {
    return saleApi.getSaleById(id);
  },

  createSale: async (saleData) => {
    return saleApi.createSale(saleData);
  },

  updateSale: async (id, saleData) => {
    return saleApi.updateSale(id, saleData);
  },

  deleteSale: async (id) => {
    return saleApi.deleteSale(id);
  },

  releaseSale: async (id) => {
    return saleApi.releaseSale(id);
  },
};

export default saleService;