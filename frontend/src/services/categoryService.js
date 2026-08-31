import categoryApi from "../api/categoryApi";

const categoryService = {
  getCategories: async () => {
    return await categoryApi.getCategories();
  },

  getCategoryById: async (id) => {
    return await categoryApi.getCategoryById(id);
  },

  createCategory: async (categoryData) => {
    return await categoryApi.createCategory(categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return await categoryApi.updateCategory(
      id,
      categoryData
    );
  },

  deleteCategory: async (id) => {
    return await categoryApi.deleteCategory(id);
  },
};

export default categoryService;