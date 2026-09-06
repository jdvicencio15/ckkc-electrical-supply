
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

  // Journal Entries
  getJournalEntries: async () => {
    const response = await API.get("/accounting/journal-entries");

    return response.data;
  },

  getJournalEntryById: async (id) => {
    const response = await API.get(
      `/accounting/journal-entries/${id}`
    );

    return response.data;
  },

  createJournalEntry: async (journalEntryData) => {
    const response = await API.post(
      "/accounting/journal-entries",
      journalEntryData
    );

    return response.data;
  },

  updateJournalEntry: async (id, journalEntryData) => {
    const response = await API.put(
      `/accounting/journal-entries/${id}`,
      journalEntryData
    );

    return response.data;
  },

  deleteJournalEntry: async (id) => {
    const response = await API.delete(
      `/accounting/journal-entries/${id}`
    );

    return response.data;
  },

  // General Ledger
  getGeneralLedger: async (params = {}) => {
    const response = await API.get("/accounting/ledger", {
      params,
    });

    return response.data;
  },

// Trial Balance
getTrialBalance: async () => {
  const response = await API.get(
    "/accounting/trial-balance"
  );

  return response.data;
},

};

export default accountingApi;

