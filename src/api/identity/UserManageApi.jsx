import axiosInstance from "../axiosInstance";

export const userManageApi = {
  getAll: (params) => axiosInstance.get("/admin/users", { params }),
  getById: (id) => axiosInstance.get(`/admin/users/${id}`),
  updateStatus: (id, status) => axiosInstance.put(`/admin/users/${id}/userStatus=${status}`, {}),
  delete: (id) => axiosInstance.delete(`/admin/users/${id}`),
  getPendingSellers: (params) => axiosInstance.get("/admin/sellers/pending", { params }),
  getSellers: (params) => axiosInstance.get("/admin/sellers", { params }),
  approveSeller: (id) => axiosInstance.post(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, note) => axiosInstance.post(`/admin/sellers/${id}/reject`, { note }),
};


export default userManageApi;
