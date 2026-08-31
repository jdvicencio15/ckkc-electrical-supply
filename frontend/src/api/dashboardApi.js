import API from "./axios";

const dashboardApi = {
  getSales: async () => {
    const response = await API.get("/sales");

    return response.data;
    },

   getProducts: async () => {
    const response = await API.get("/products");

    return response.data;
  },


};

export default dashboardApi;