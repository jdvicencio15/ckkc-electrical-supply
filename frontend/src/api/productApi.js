
import API from "./axios";

const productApi = {
  getProducts: async () => {
    const response = await API.get("/products");

    return response.data;
  },

  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);

    return response.data;
  },

  createProduct: async (productData) => {
    const response = await API.post("/products", productData);

    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);

    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);

    return response.data;
  },
};

export default productApi;

