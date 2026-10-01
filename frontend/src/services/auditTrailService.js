import auditTrailApi from "../api/auditTrailApi";

const auditTrailService = {
  getAuditTrails: async (params = {}) => {
    const data = await auditTrailApi.getAuditTrails(params);

    return data;
  },

  getAuditTrailById: async (id) => {
    const data = await auditTrailApi.getAuditTrailById(id);

    return data;
  },
};

export default auditTrailService;