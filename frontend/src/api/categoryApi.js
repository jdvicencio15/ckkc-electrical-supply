import API from "./axios";

const categoryApi = {
  getCategories: async () => {
    const response = await API.get("/categories");

    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await API.get(`/categories/${id}`);

    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await API.post(
      "/categories",
      categoryData
    );

    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await API.put(
      `/categories/${id}`,
      categoryData
    );

    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await API.delete(
      `/categories/${id}`
    );

    return response.data;
  },
};

export default categoryApi;