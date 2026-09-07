
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

  uploadLogo: async (formData) => {
    const data =
      await settingsApi.uploadLogo(formData);

    return data;
  },

  removeLogo: async () => {
    const data =
      await settingsApi.removeLogo();

    return data;
  },
};

export default settingsService;

