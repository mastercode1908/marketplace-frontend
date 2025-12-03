import axiosInstance from "../axiosInstance";

const reportApi = {
    getAllReports: async () => {
        const res = await axiosInstance.get("/admin/reports");
        return res.data;
    },

    updateReportStatus: async (id, status) => {
        const res = await axiosInstance.put(`/admin/reports/${id}`, { status });
        return res.data;
    },
};

export default reportApi;
