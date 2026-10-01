import api from "./axios";

const auditTrailApi = {
  getAuditTrails: async (params = {}) => {
    const response = await api.get("/audit-trails", {
      params,
    });

    return response.data;
  },

  getAuditTrailById: async (id) => {
    const response = await api.get(`/audit-trails/${id}`);

    return response.data;
  },
};

export default auditTrailApi;