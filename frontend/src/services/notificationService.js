import notificationApi from "../api/notificationApi";

const notificationService = {
  getNotifications: async () => {
    const data = await notificationApi.getNotifications();
    return data;
  },

  markAsRead: async (id) => {
    const data = await notificationApi.markAsRead(id);
    return data;
  },

  markAllAsRead: async () => {
    const data = await notificationApi.markAllAsRead();
    return data;
  },

  deleteNotification: async (id) => {
    const data = await notificationApi.deleteNotification(id);
    return data;
  },
};

export default notificationService;