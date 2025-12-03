import axiosInstance from "../axiosInstance";

export const flashSaleApi = {
 
  getAll: () => axiosInstance.get("/admin/flashsale"),

  getById: (id) => axiosInstance.get(`/admin/flashsale/${id}`),

  create: (data) => axiosInstance.post("/admin/flashsale", data),

  update: (id, data) => axiosInstance.put(`/admin/flashsale/${id}/update`, data),
  
  delete: (id) => axiosInstance.delete(`/admin/flashsale/${id}/delete`),
};

export default flashSaleApi;
