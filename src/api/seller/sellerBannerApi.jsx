import axiosInstance from "../axiosInstance";

const sellerBannerApi = {
    // Lấy danh sách banner của seller
    getMyBanners: async (page = 0, size = 10) => {
        const res = await axiosInstance.get("/seller/banners", {
            params: { page, size },
        });
        return res.data;
    },

    // Lấy chi tiết banner
    getBannerById: async (id) => {
        const res = await axiosInstance.get(`/seller/banners/${id}`);
        return res.data;
    },

    // Tạo banner mới
    createBanner: async (data) => {
        const res = await axiosInstance.post("/seller/banners", data);
        return res.data;
    },

    // Cập nhật banner
    updateBanner: async (id, data) => {
        const res = await axiosInstance.put(`/seller/banners/${id}`, data);
        return res.data;
    },

    // Xóa banner
    deleteBanner: async (id) => {
        const res = await axiosInstance.delete(`/seller/banners/${id}`);
        return res.data;
    },

    // Tạm dừng banner
    pauseBanner: async (id) => {
        const res = await axiosInstance.post(`/seller/banners/${id}/pause`);
        return res.data;
    },

    // Tiếp tục banner
    resumeBanner: async (id) => {
        const res = await axiosInstance.post(`/seller/banners/${id}/resume`);
        return res.data;
    },
};

export default sellerBannerApi;
