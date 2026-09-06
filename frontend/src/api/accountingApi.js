
import API from "./axios";

const accountingApi = {
  // Chart of Accounts
  getAccounts: async () => {
    const response = await API.get("/accounting/accounts");

    return response.data;
  },

  getAccountById: async (id) => {
    const response = await API.get(`/accounting/accounts/${id}`);

    return response.data;
  },

  createAccount: async (accountData) => {
    const response = await API.post("/accounting/accounts", accountData);

    return response.data;
  },

  updateAccount: async (id, accountData) => {
    const response = await API.put(
      `/accounting/accounts/${id}`,
      accountData
    );

    return response.data;
  },

  deleteAccount: async (id) => {
    const response = await API.delete(`/accounting/accounts/${id}`);

    return response.data;
  },
};

export default accountingApi;

