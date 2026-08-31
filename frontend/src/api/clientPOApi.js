import API from "./axios";

const clientPOApi = {
  getClientPOs: async () => {
    const response = await API.get("/client-pos");

    return response.data;
  },

  getClientPOById: async (id) => {
    const response = await API.get(`/client-pos/${id}`);

    return response.data;
  },

  createClientPO: async (clientPOData) => {
    const response = await API.post("/client-pos", clientPOData);

    return response.data;
  },

  updateClientPO: async (id, clientPOData) => {
    const response = await API.put(
      `/client-pos/${id}`,
      clientPOData,
    );

    return response.data;
  },

  deleteClientPO: async (id) => {
    const response = await API.delete(`/client-pos/${id}`);

    return response.data;
  },
};

export default clientPOApi;