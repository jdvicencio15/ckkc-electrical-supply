import settingsApi from "../api/settingsApi";

const settingsService = {
  getSettings: async () => {
    const data = await settingsApi.getSettings();
    return data;
  },

  updateSettings: async (settingsData) => {
    const data =
      await settingsApi.updateSettings(settingsData);

    return data;
  },
};

export default settingsService;