import axiosInstance from "../axiosInstance";

export const servicePackageApi = {
  getAll: () => axiosInstance.get("/admin/service-packages"),

  getById: (id) => axiosInstance.get(`/admin/service-packages/${id}`),

  create: (data) => axiosInstance.post("/admin/service-packages", data),

  update: (id, data) =>
    axiosInstance.put(`/admin/service-packages/${id}`, data),

  delete: (id) => axiosInstance.delete(`/admin/service-packages/${id}`),
};

export default servicePackageApi;
