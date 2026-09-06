import quotationApi from "../api/quotationApi";

const quotationService = {
  getQuotations: async () => {
    const data = await quotationApi.getQuotations();

    return data;
  },

  getQuotationById: async (id) => {
    const data =
      await quotationApi.getQuotationById(id);

    return data;
  },

  createQuotation: async (quotationData) => {
    const data =
      await quotationApi.createQuotation(
        quotationData
      );

    return data;
  },

  updateQuotation: async (id, quotationData) => {
    const data =
      await quotationApi.updateQuotation(
        id,
        quotationData
      );

    return data;
  },

  deleteQuotation: async (id) => {
    const data =
      await quotationApi.deleteQuotation(id);

    return data;
  },
};

export default quotationService;