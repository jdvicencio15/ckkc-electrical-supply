import expenseApi from "../api/expenseApi";

const expenseService = {
  getExpenses: async () => {
    const data = await expenseApi.getExpenses();

    return data;
  },

  getExpenseById: async (id) => {
    const data = await expenseApi.getExpenseById(id);

    return data;
  },

  createExpense: async (expenseData) => {
    const data = await expenseApi.createExpense(expenseData);

    return data;
  },

  updateExpense: async (id, expenseData) => {
    const data = await expenseApi.updateExpense(id, expenseData);

    return data;
  },

  deleteExpense: async (id) => {
    const data = await expenseApi.deleteExpense(id);

    return data;
  },

  postExpense: async (id) => {
    const data = await expenseApi.postExpense(id);

    return data;
  },
};

export default expenseService;