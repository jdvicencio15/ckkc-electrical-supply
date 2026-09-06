import accountingApi from "../api/accountingApi";

const chartOfAccountsService = {
  getAccounts: async () => {
    const data = await accountingApi.getAccounts();
    return data;
  },

  getAccountById: async (id) => {
    const data = await accountingApi.getAccountById(id);
    return data;
  },

  createAccount: async (accountData) => {
    const data = await accountingApi.createAccount(accountData);
    return data;
  },

  updateAccount: async (id, accountData) => {
    const data = await accountingApi.updateAccount(id, accountData);
    return data;
  },

  deleteAccount: async (id) => {
    const data = await accountingApi.deleteAccount(id);
    return data;
  },
};

export default chartOfAccountsService;