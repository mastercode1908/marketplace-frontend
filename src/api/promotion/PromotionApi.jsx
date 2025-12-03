import axiosInstance from "../axiosInstance";

export const promotionApi = {
  getAll: () => axiosInstance.get("/promotions"),

  getById: (id) => axiosInstance.get(`/promotions/${id}`),

  create: (data) => axiosInstance.post("/promotions", data),

  update: (id, data) => axiosInstance.put(`/promotions/${id}`, data),

  delete: (id) => axiosInstance.delete(`/promotions/${id}`),

  preview: (data) => axiosInstance.post("/promotions/preview", data),

  getBySellerId: (sellerId) =>
    axiosInstance.get(`/promotions/seller/${sellerId}`),

  // Seller promotion methods
  getSellerPromotions: (page = 0, size = 10) =>
    axiosInstance.get(`/promotions/seller/my-promotions?page=${page}&size=${size}`),
  
  createSellerPromotion: (data) => axiosInstance.post("/promotions/seller", data),
  
  updateSellerPromotion: (id, data) => axiosInstance.put(`/promotions/seller/${id}`, data),
  
  deleteSellerPromotion: (id) => axiosInstance.delete(`/promotions/seller/${id}`),
};

export default promotionApi;
