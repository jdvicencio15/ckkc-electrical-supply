import API from "./axios";

const authApi = {
  login: async (credentials) => {
    const response = await API.post(
      "/auth/login",
      credentials
    );

    return response.data;
  },

  register: async (userData) => {
    const response = await API.post(
      "/auth/register",
      userData
    );

    return response.data;
  },

  getMe: async () => {
    const response = await API.get("/users/me");

    return response.data;
  },
};

export default authApi;