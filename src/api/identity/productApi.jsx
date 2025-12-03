// src/api/identity/authApi.js
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../../utils/constants";
// import axiosPublic from "../axiosPublic";

//Tao ra 1 object, await doi muon dung dc phai co async
const productApi = {
    createProduct: async (data) => {
        const res = await axiosInstance.post(API_ENDPOINTS.PRODUCTS, data);
        // const res = await axiosInstance.post("/v1/auth/login", data);
        return res.data;
    },
    updateProduct: async (data, id) => {
        const res = await axiosInstance.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, data)
        return res.data
    },
    getAll: async () => {
        const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
        return res.data;
    },
    getById: async (id) => {
        const res = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        return res.data;
    },
    deleteProduct: async (id) => {
        const res = await axiosInstance.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        return res.data;
    },
    getBySeller: async () => {
        const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS_SELLER);
        return res.data;
    },
    getShopInfo: async (sellerId) => {
        const res = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/shop/${sellerId}`);
        return res.data;
    },
    getShopProducts: async (sellerId) => {
        const res = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/shop/${sellerId}/products`);
        return res.data;
    },
    getPromotedProducts: async () => {
        const res = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/promoted`);
        return res.data;
    },
};

export default productApi;
