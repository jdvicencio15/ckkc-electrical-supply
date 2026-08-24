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

  forgotPassword: async (email) => {
    const data = await authApi.forgotPassword(email);

    return data;
  },

  resetPassword: async (data) => {
  const response = await authApi.resetPassword(data);

  return response;
    },


  getMe: async () => {
    const data = await authApi.getMe();

    return data;
  },
};

export default authService;