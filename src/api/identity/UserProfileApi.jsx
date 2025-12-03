/* eslint-disable no-unused-vars */
import axiosInstance from "../axiosInstance";
import { ShippingApi } from "../shipping/ShippingApi";

const getUserId = () => {
  const localUserStr = localStorage.getItem("user");
  if (!localUserStr) return null;

  try {
    const localUser = JSON.parse(localUserStr);
    return (
      localUser?.user?.id ||
      localUser?.data?.user?.id ||
      localUser?.id ||
      localUser?.data?.id ||
      localUser?.userId ||
      null
    );
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    return null;
  }
};

const userApi = {
  getCurrentProfile: async () => {
    try {
      const res = await axiosInstance.get(`/buyer`);
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      const updatedUser = {
        ...currentUser,
        user: {
          ...currentUser.user,
          ...res.data.user,
          avatarUrl: res.data.user?.avatarUrl || currentUser.user?.avatarUrl || null
        },
        buyer: {
          ...currentUser.buyer,
          ...res.data.buyer
        },
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return res.data;
    } catch (error) {
      console.error("Error getting user profile:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("URL:", error.config?.url);
      }
      throw error;
    }
  },

  getProfile: (userId) => axiosInstance.get(`/buyer/${userId}`),

  updateCurrentProfile: async (data, avatarFile) => {
    try {
      let avatarUrl = data.avatarUrl || data.avata || data.avatar || null;

      // Nếu có file avatar mới, upload lên backend trước
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await axiosInstance.post("/buyer/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        avatarUrl = uploadRes.data.avatarUrl; // URL thực tế từ backend
      }

      const updateRequest = {
        buyer: {
          address: data.address || null,
          dateOfBirth: data.dateOfBirth || data.dob || null
        },
        user: {
          username: data.username || null,
          fullName: data.fullName || data.full_name || null,
          phone: data.phone || null,
          gender: data.gender ?? null,
          avatarUrl,
          email: data.email || null,
          password: null,
          role: null
        }
      };

      const res = await axiosInstance.patch(`/buyer/update`, updateRequest, {
        skipAutoRedirect: true
      });

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUser,
        user: {
          ...currentUser.user,
          ...res.data.user,
          avatarUrl: res.data.user?.avatarUrl || avatarUrl
        },
        buyer: {
          ...currentUser.buyer,
          ...res.data.buyer
        }
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return res.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Status:", error.response.status);
      }
      throw error;
    }
  },

  updateProfile: (userId, data) => {
    const updateRequest = {
      buyer: {
        address: data.address,
        dateOfBirth: data.dateOfBirth || data.dob
      },
      user: {
        username: data.username,
        fullName: data.fullName || data.full_name,
        phone: data.phone,
        gender: data.gender,
        avatarUrl: data.avatarUrl || data.avata || data.avatar,
        email: data.email,
        password: null,
        role: null
      }
    };
    return axiosInstance.patch(`/buyer/update`, updateRequest);
  },

  getCurrentBuyerProfile: async () => userApi.getCurrentProfile(),
  updateCurrentBuyerProfile: async (data, avatarFile) => userApi.updateCurrentProfile(data, avatarFile),

  // Address management methods
  getAddresses: async () => {
    try {
      const res = await ShippingApi.getAddresses();
      return res.data || res;
    } catch (error) {
      console.error("Error getting addresses:", error);
      throw error;
    }
  },

  getProvinces: async () => {
    try {
      const res = await ShippingApi.getProvinces();
      return res.data || res;
    } catch (error) {
      console.error("Error getting provinces:", error);
      throw error;
    }
  },

  getDistricts: async (provinceId) => {
    try {
      const res = await ShippingApi.getDistricts(provinceId);
      return res.data || res;
    } catch (error) {
      console.error("Error getting districts:", error);
      throw error;
    }
  },

  getWards: async (districtId) => {
    try {
      const res = await ShippingApi.getWards(districtId);
      return res.data || res;
    } catch (error) {
      console.error("Error getting wards:", error);
      throw error;
    }
  },

  createAddress: async (data) => {
    try {
      const res = await ShippingApi.createAddress(data);
      return res.data || res;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  },

  updateAddress: async (addressId, data) => {
    try {
      // Lấy thông tin address hiện tại để giữ nguyên isDefault nếu cần
      let currentAddress = null;
      try {
        const addressRes = await ShippingApi.getAddress(addressId);
        currentAddress = addressRes.data || addressRes;
      } catch (e) {
        console.warn("Could not fetch current address:", e);
      }
      
      // Giữ nguyên isDefault từ address cũ nếu không được chỉ định trong data mới
      const updateData = {
        ...data,
        isDefault: data.isDefault !== undefined ? data.isDefault : (currentAddress?.isDefault || false),
      };
      
      // Backend chưa có endpoint update, tạm thời dùng cách xóa và tạo lại
      // TODO: Implement proper update endpoint in backend (PUT /api/shipping/addresses/{addressId})
      await ShippingApi.deleteAddress(addressId);
      const res = await ShippingApi.createAddress(updateData);
      return res.data || res;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      await ShippingApi.deleteAddress(addressId);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      // Lấy thông tin address hiện tại
      const addressRes = await ShippingApi.getAddress(addressId);
      const address = addressRes.data || addressRes;
      
      // Tạo lại address với isDefault = true
      const addressData = {
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        addressDetail: address.addressDetail,
        wardCode: address.wardCode,
        districtId: address.districtId,
        provinceName: address.provinceName,
        isDefault: true,
      };
      
      // Xóa address cũ và tạo lại với isDefault = true
      await ShippingApi.deleteAddress(addressId);
      const res = await ShippingApi.createAddress(addressData);
      return res.data || res;
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  },
};

export default userApi;
