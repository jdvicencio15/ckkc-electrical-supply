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
};

export default settingsApi;