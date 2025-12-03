import axiosInstance from "../axiosInstance";

const bannerApi = {
    // Lấy banner cho homepage (public API)
    getHomepageBanners: async () => {
        const res = await axiosInstance.get("/banners/homepage");
        return res.data;
    },
};

export default bannerApi;
