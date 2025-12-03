import axiosInstance from "../axiosInstance";

const servicePackageApi = {
    // Get all available service packages
    getAvailablePackages: async () => {
        const res = await axiosInstance.get("/seller/service-packages");
        return res.data;
    },

    // Purchase a service package
    purchasePackage: async (packageId) => {
        const res = await axiosInstance.post(`/seller/service-packages/${packageId}`);
        return res.data;
    },

    // Get seller's purchased packages
    getMyPackages: async () => {
        const res = await axiosInstance.get("/seller/service-packages/my-package");
        return res.data;
    },

    // Add product to enhanced promotion
    addProductToPromotion: async (productId) => {
        const res = await axiosInstance.post(`/seller/service-packages/package-usage/${productId}`);
        return res.data;
    },

    // Get list of promoted product IDs
    getPromotedProductIds: async () => {
        const res = await axiosInstance.get("/seller/service-packages/promoted-products");
        return res.data;
    },
};

export default servicePackageApi;
