import axiosInstance from "../axiosInstance";

/**
 * API service cho đơn hàng
 */
export const OrderApi = {
  // Lấy danh sách đơn hàng của buyer (với phân trang)
  getBuyerOrders: (page = 0, size = 10) => 
    axiosInstance.get(`/orders/buyer?page=${page}&size=${size}&sort=orderDate,desc`),

  // Lấy danh sách đơn hàng của seller (với phân trang)
  getSellerOrders: (page = 0, size = 10) => 
    axiosInstance.get(`/orders/seller?page=${page}&size=${size}&sort=orderDate,desc`),

  // Lấy chi tiết đơn hàng
  getOrder: (orderId) => axiosInstance.get(`/orders/${orderId}`),

  // Hủy đơn hàng
  cancelOrder: (orderId, reason = null) => {
    const data = reason ? { reason } : {};
    return axiosInstance.put(`/orders/${orderId}/cancel`, data);
  },
};





