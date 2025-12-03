import axiosInstance from "../axiosInstance";

const adminBannerApi = {
    // Lấy tất cả banner (có phân trang)
    getAllBanners: async (page = 0, size = 10) => {
        const res = await axiosInstance.get("/admin/banners", {
            params: { page, size },
        });
        return res.data;
    },

    // Lấy chi tiết banner
    getBannerById: async (id) => {
        const res = await axiosInstance.get(`/admin/banners/${id}`);
        return res.data;
    },

    // Duyệt banner
    approveBanner: async (id) => {
        const res = await axiosInstance.post(`/admin/banners/${id}/approve`);
        return res.data;
    },

    // Từ chối banner
    rejectBanner: async (id, rejectionReason) => {
        const res = await axiosInstance.post(`/admin/banners/${id}/reject`, {
            rejectionReason,
        });
        return res.data;
    },
};

export default adminBannerApi;
