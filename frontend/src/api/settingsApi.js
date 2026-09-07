
import API from "./axios";

const settingsApi = {
  getSettings: async () => {
    const response = await API.get("/settings");

    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await API.put(
      "/settings",
      settingsData
    );

    return response.data;
  },

  uploadLogo: async (formData) => {
    const response = await API.post(
      "/settings/logo",
      formData
    );

    return response.data;
  },

  removeLogo: async () => {
    const response = await API.delete(
      "/settings/logo"
    );

    return response.data;
  },
};

export default settingsApi;

