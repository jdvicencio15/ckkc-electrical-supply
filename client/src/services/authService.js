
import authApi from "../api/authApi";

const authService = {
  login: async (credentials) => {
    const data = await authApi.login(credentials);

    return data;
  },

  register: async (userData) => {
    const data = await authApi.register(userData);

    return data;
  },
};

export default authService;

