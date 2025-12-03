import axiosInstance from "../axiosInstance";

export const productReportApi = {
  createReport: (productId, payload) =>
    axiosInstance.post(`/buyer/reports/${productId}`, payload),
  getMyReports: () => axiosInstance.get("/buyer/reports"),
  getAllReports: () => axiosInstance.get("/admin/reports"),
  updateReportStatus: (reportId, payload) =>
    axiosInstance.put(`/admin/reports/${reportId}`, payload),
};







