import axiosInstance from "../axiosInstance";

export const reviewApi = {
  createReview: (productId, payload) =>
    axiosInstance.post(`/reviews/${productId}`, payload),
  getProductReviews: (productId) =>
    axiosInstance.get(`/products/${productId}/reviews`),
  updateReview: (reviewId, payload) =>
    axiosInstance.patch(`/reviews/${reviewId}`, payload),
  deleteReview: (reviewId, payload) =>
    axiosInstance.post(`/reviews/${reviewId}/delete`, payload),
};







