import axiosInstance from "../axiosInstance";

const sellerDashboardApi = {
    // Get KPI metrics
    getKPI: async () => {
        const res = await axiosInstance.get("/seller/dashboard/kpi");
        return res.data;
    },

    // Get order growth data
    getOrderGrowth: async (period = "daily") => {
        const res = await axiosInstance.get(`/seller/dashboard/order-growth?period=${period}`);
        return res.data;
    },

    // Get review statistics
    getReviewStats: async () => {
        const res = await axiosInstance.get("/seller/dashboard/review-stats");
        return res.data;
    },

    // Get commission details
    getCommissions: async () => {
        const res = await axiosInstance.get("/seller/dashboard/commissions");
        return res.data;
    },

    // Get top products
    getTopProducts: async (limit = 5) => {
        const res = await axiosInstance.get(`/seller/dashboard/top-products?limit=${limit}`);
        return res.data;
    },
};

export default sellerDashboardApi;
