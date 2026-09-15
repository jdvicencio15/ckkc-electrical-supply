import API from "./axios";

const expenseApi = {
  getExpenses: async () => {
    const response = await API.get("/expenses");

    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await API.get(`/expenses/${id}`);

    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await API.post("/expenses", expenseData);

    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await API.put(
      `/expenses/${id}`,
      expenseData,
    );

    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await API.delete(`/expenses/${id}`);

    return response.data;
  },

  postExpense: async (id) => {
    const response = await API.post(`/expenses/${id}/post`);

    return response.data;
  },
};

export default expenseApi;