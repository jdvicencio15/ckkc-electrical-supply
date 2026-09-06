import API from "./axios";

const quotationApi = {
  getQuotations: async () => {
    const response = await API.get("/quotations");
    return response.data;
  },

  getQuotationById: async (id) => {
    const response = await API.get(`/quotations/${id}`);
    return response.data;
  },

  createQuotation: async (quotationData) => {
    const response = await API.post(
      "/quotations",
      quotationData
    );

    return response.data;
  },

  updateQuotation: async (id, quotationData) => {
    const response = await API.put(
      `/quotations/${id}`,
      quotationData
    );

    return response.data;
  },

  deleteQuotation: async (id) => {
    const response = await API.delete(
      `/quotations/${id}`
    );

    return response.data;
  },
};

export default quotationApi;