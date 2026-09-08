import API from "./axios";

const unitApi = {
  getUnits: async () => {
    const response = await API.get("/units");
    return response.data;
  },

  getActiveUnits: async () => {
    const response = await API.get("/units/active");
    return response.data;
  },

  getUnitById: async (id) => {
    const response = await API.get(`/units/${id}`);
    return response.data;
  },

  createUnit: async (unitData) => {
    const response = await API.post("/units", unitData);
    return response.data;
  },

  updateUnit: async (id, unitData) => {
    const response = await API.put(`/units/${id}`, unitData);
    return response.data;
  },

  deleteUnit: async (id) => {
    const response = await API.delete(`/units/${id}`);
    return response.data;
  },
};

export default unitApi;