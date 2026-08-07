import API from "./axios";

console.log("AXIOS CHECK:", API);

const authApi = {
  login: async (credentials) => {
    const response = await API.post(
      "/api/auth/login",
      credentials
    );

    return response.data;
  },

  register: async (userData) => {
    const response = await API.post(
      "/api/auth/register",
      userData
    );

    return response.data;
  },
};

export default authApi;