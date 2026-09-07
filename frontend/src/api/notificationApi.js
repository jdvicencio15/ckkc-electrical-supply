import API from "./axios";

const notificationApi = {
  getNotifications: async () => {
    const response = await API.get("/notifications");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await API.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await API.patch("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationApi;