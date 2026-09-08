import userApi from "../api/userApi";

const userService = {
  // ==============================
  // Get All Users
  // ==============================

  getUsers: async () => {
    const data = await userApi.getUsers();

    return data;
  },

  // ==============================
  // Get Single User
  // ==============================

  getUserById: async (id) => {
    const data = await userApi.getUserById(id);

    return data;
  },

  // ==============================
  // Create User
  // ==============================

  createUser: async (userData) => {
    const data = await userApi.createUser(
      userData
    );

    return data;
  },

  // ==============================
  // Update User
  // ==============================

  updateUser: async (id, userData) => {
    const data = await userApi.updateUser(
      id,
      userData
    );

    return data;
  },

  // ==============================
  // Update User Status
  // ==============================

  updateUserStatus: async (id, isActive) => {
    const data =
      await userApi.updateUserStatus(
        id,
        isActive
      );

    return data;
  },

    // ==============================
  // Update Current User Profile
  // ==============================

  updateMyProfile: async (userData) => {
    const data = await userApi.updateMyProfile(
      userData
    );

    return data;
  },

  // ==============================
  // Change Current User Password
  // ==============================

  changeMyPassword: async (passwordData) => {
    const data = await userApi.changeMyPassword(
      passwordData
    );

    return data;
  },


};



export default userService;