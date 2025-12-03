import axiosInstance from "../axiosInstance";

const adminDashboardApi = {
    getRevenueChart: async (period = 'daily') => {
        const response = await axiosInstance.get('/admin/dashboard/revenue-chart', {
            params: { period }
        });
        return response.data;
    },

    getKPIs: async () => {
        const response = await axiosInstance.get('/admin/dashboard/kpis');
        return response.data;
    },

    getOrderStatusChart: async () => {
        const response = await axiosInstance.get('/admin/dashboard/order-status-chart');
        return response.data;
    },

    getUserGrowthChart: async () => {
        const response = await axiosInstance.get('/admin/dashboard/user-growth-chart');
        return response.data;
    },

    getTopSellersProducts: async () => {
        const response = await axiosInstance.get('/admin/dashboard/top-sellers-products');
        return response.data;
    },

    getCategoryDistribution: async () => {
        const response = await axiosInstance.get('/admin/dashboard/category-distribution');
        return response.data;
    },

    getRevenueReport: async (params) => {
        const response = await axiosInstance.get('/admin/reports/revenue', { params });
        return response.data;
    },

    getSellers: async () => {
        const response = await axiosInstance.get('/admin/reports/revenue/sellers');
        return response.data;
    },

    exportExcel: async (params) => {
        const response = await axiosInstance.get('/admin/reports/revenue/export/excel', {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    exportPDF: async (params) => {
        const response = await axiosInstance.get('/admin/reports/revenue/export/pdf', {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    // Revenue với commission 7%
    getAdminRevenue: async (params) => {
        const response = await axiosInstance.get('/admin/dashboard/revenue', { params });
        return response.data;
    },

    // Danh sách đơn hàng chi tiết
    getOrderDetails: async (params) => {
        const response = await axiosInstance.get('/admin/dashboard/revenue/orders', { params });
        return response.data;
    },
};

export default adminDashboardApi;


