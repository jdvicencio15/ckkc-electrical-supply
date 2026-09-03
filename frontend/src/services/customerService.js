import customerApi from "../api/customerApi";

const customerService = {
  getCustomers: async () => {
    const data = await customerApi.getCustomers();
    return data;
  },

  getCustomerById: async (id) => {
    const data = await customerApi.getCustomerById(id);
    return data;
  },

  createCustomer: async (customerData) => {
    const data = await customerApi.createCustomer(customerData);
    return data;
  },

  updateCustomer: async (id, customerData) => {
    const data = await customerApi.updateCustomer(id, customerData);
    return data;
  },

  deleteCustomer: async (id) => {
    const data = await customerApi.deleteCustomer(id);
    return data;
  },
};

export default customerService;