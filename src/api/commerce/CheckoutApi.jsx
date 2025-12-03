import axiosInstance from "../axiosInstance";

/**
 * API service cho checkout
 */
export const CheckoutApi = {
  // Thanh toán
  checkout: (data) => axiosInstance.post("/checkout", data),
};








