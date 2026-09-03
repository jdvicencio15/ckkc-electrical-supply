import API from "./axios";

const customerApi = {
  getCustomers: async () => {
    const response = await API.get("/customers");
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await API.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await API.post("/customers", customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await API.put(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await API.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerApi;