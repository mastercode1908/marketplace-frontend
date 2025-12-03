import axiosInstance from "../axiosInstance";

/**
 * API service cho giỏ hàng
 */
export const CartApi = {
  // Lấy giỏ hàng
  getCart: () => axiosInstance.get("/cart"),

  // Thêm sản phẩm vào giỏ hàng
  addItem: (data) => axiosInstance.post("/cart/items", data),

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateQuantity: (itemId, quantity) =>
    axiosInstance.put(`/cart/items/${itemId}/quantity`, { quantity }),

  // Xóa một sản phẩm khỏi giỏ hàng
  deleteItem: (itemId) => axiosInstance.delete(`/cart/items/${itemId}`),

  // Xóa tất cả sản phẩm khỏi giỏ hàng
  clearCart: () => axiosInstance.delete("/cart"),
};


