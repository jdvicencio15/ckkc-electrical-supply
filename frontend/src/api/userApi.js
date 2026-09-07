import API from "./axios";

const userApi = {
  // ==============================
  // Get All Users
  // ==============================

  getUsers: async () => {
    const response = await API.get("/users");

    return response.data;
  },

  // ==============================
  // Get Single User
  // ==============================

  getUserById: async (id) => {
    const response = await API.get(`/users/${id}`);

    return response.data;
  },

  // ==============================
  // Create User
  // ==============================

  createUser: async (userData) => {
    const response = await API.post(
      "/users",
      userData
    );

    return response.data;
  },

  // ==============================
  // Update User
  // ==============================

  updateUser: async (id, userData) => {
    const response = await API.put(
      `/users/${id}`,
      userData
    );

    return response.data;
  },

  // ==============================
  // Update User Status
  // ==============================

  updateUserStatus: async (id, isActive) => {
    const response = await API.patch(
      `/users/${id}/status`,
      { isActive }
    );

    return response.data;
  },
};

export default userApi;