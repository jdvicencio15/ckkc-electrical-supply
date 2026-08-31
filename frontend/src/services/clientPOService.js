import clientPOApi from "../api/clientPOApi";

const clientPOService = {
  getClientPOs: async () => {
    const data = await clientPOApi.getClientPOs();

    return data;
  },

  getClientPOById: async (id) => {
    const data = await clientPOApi.getClientPOById(id);

    return data;
  },

  createClientPO: async (clientPOData) => {
    const data = await clientPOApi.createClientPO(clientPOData);

    return data;
  },

  updateClientPO: async (id, clientPOData) => {
    const data = await clientPOApi.updateClientPO(id, clientPOData);

    return data;
  },

  deleteClientPO: async (id) => {
    const data = await clientPOApi.deleteClientPO(id);

    return data;
  },
};

export default clientPOService;