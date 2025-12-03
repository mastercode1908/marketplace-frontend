import axiosInstance from "../axiosInstance";

const contentAdminApi = {

    getPendingProducts: async () => {
        const res = await axiosInstance.get("/admin/products/pending");
        return res.data;
    },

    getProducts: async (status) => {
        const res = await axiosInstance.get("/admin/products", {
            params: { status },
        });
        return res.data;
    },

    updateProductStatus: async (productId, status, note) => {
        // API expects body: { "productStatus": "APPROVED" | "REJECTED", "text": "Reason" }
        const res = await axiosInstance.put(`/admin/product/${productId}/status`, {
            productStatus: status,
            text: note,
        });
        return res.data;
    },
};

export default contentAdminApi;
