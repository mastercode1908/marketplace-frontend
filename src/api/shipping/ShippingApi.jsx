import axiosInstance from "../axiosInstance";
import axiosPublic from "../axiosPublic";

/**
 * API service cho shipping và địa chỉ
 */
export const ShippingApi = {
  // Lấy danh sách tỉnh/thành phố (công khai, không cần auth)
  getProvinces: () => axiosPublic.get("/shipping/provinces"),

  // Lấy danh sách quận/huyện (công khai, không cần auth)
  getDistricts: (provinceId) =>
    axiosPublic.get(`/shipping/districts?provinceId=${provinceId}`),

  // Lấy danh sách phường/xã (công khai, không cần auth)
  getWards: (districtId) =>
    axiosPublic.get(`/shipping/wards?districtId=${districtId}`),

  // Tạo địa chỉ
  createAddress: (data) =>
    axiosInstance.post("/shipping/addresses", data),

  // Lấy danh sách địa chỉ
  getAddresses: () =>
    axiosInstance.get("/shipping/addresses"),

  // Lấy địa chỉ theo ID
  getAddress: (addressId) =>
    axiosInstance.get(`/shipping/addresses/${addressId}`),

  // Xóa địa chỉ
  deleteAddress: (addressId) =>
    axiosInstance.delete(`/shipping/addresses/${addressId}`),

  // Chuẩn bị checkout
  prepareCheckout: (addressId) =>
    axiosInstance.get(`/shipping/checkout/prepare?addressId=${addressId}`),

  // GHN Shop Info - Lấy thông tin GHN shop của seller
  getGHNShopInfo: () =>
    axiosInstance.get("/shipping/ghn-shop-info"),

  // GHN Shop Info - Nhập/cập nhật thông tin GHN shop
  saveOrUpdateGHNShopInfo: (data) =>
    axiosInstance.post("/shipping/ghn-shop-info", data),

  // GHN Shop Info - Preview shop info từ GHN (không lưu vào DB)
  previewGHNShopInfo: (data) =>
    axiosInstance.post("/shipping/ghn-shop-info/preview", data),

  // Tính phí vận chuyển
  calculateFee: (data) =>
    axiosPublic.post("/shipping/calculate-fee", data),
};
