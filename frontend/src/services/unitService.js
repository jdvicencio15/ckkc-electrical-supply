import unitApi from "../api/unitApi";

const unitService = {
  getUnits: async () => {
    return await unitApi.getUnits();
  },

  getActiveUnits: async () => {
    return await unitApi.getActiveUnits();
  },

  getUnitById: async (id) => {
    return await unitApi.getUnitById(id);
  },

  createUnit: async (unitData) => {
    return await unitApi.createUnit(unitData);
  },

  updateUnit: async (id, unitData) => {
    return await unitApi.updateUnit(id, unitData);
  },

  deleteUnit: async (id) => {
    return await unitApi.deleteUnit(id);
  },
};

export default unitService;