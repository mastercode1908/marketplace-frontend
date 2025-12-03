import axiosInstance from "../axiosInstance";

export const notificationApi = {

  getAll: () => axiosInstance.get("/admin/notifications"),


  getById: (id) => axiosInstance.get(`/admin/notifications/${id}`),


  create: (data) => axiosInstance.post("/admin/notifications", data),


  update: (id, data) => axiosInstance.put(`/admin/notifications/${id}`, data),


  delete: (id) => axiosInstance.delete(`/admin/notifications/${id}`),

  sendNotification: (id, target) => axiosInstance.post(`/admin/notifications/${id}/send/${target}`),

  // User notifications
  getUserNotifications: () => axiosInstance.get("/users/notifications"),

  markAsRead: (notificationId) => axiosInstance.put(`/users/notifications/${notificationId}/read`),

  markAllAsRead: () => axiosInstance.put("/users/notifications/read-all"),

  hideRead: () => axiosInstance.put("/users/notifications/hide-read"),

  getUnreadCount: () => axiosInstance.get("/users/notifications/unread-count"),

  // Search users by name
  searchUsers: (name) => axiosInstance.get(`/admin/users/search?name=${encodeURIComponent(name)}`),

  // Get recipients of a notification
  getRecipients: (notificationId) => axiosInstance.get(`/admin/notifications/${notificationId}/recipients`),
};

export default notificationApi;