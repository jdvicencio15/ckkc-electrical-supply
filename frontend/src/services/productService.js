
import productApi from "../api/productApi";



const productService = {
  getProducts: async () => {
    const data = await productApi.getProducts();

    return data;
  },

  getProductById: async (id) => {
    const data = await productApi.getProductById(id);

    return data;
  },

  createProduct: async (productData) => {
    const data = await productApi.createProduct(productData);

    return data;
  },

  updateProduct: async (id, productData) => {
    const data = await productApi.updateProduct(id, productData);

    return data;
  },

  deleteProduct: async (id) => {
    const data = await productApi.deleteProduct(id);

    return data;
  },
};

export default productService;

