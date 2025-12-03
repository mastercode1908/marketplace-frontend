// src/api/identity/authApi.js
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../../utils/constants";
import axiosPublic from "../axiosPublic";

//Tao ra 1 object, await doi muon dung dc phai co async
const authApi = {
    login: async (data) => {
        const res = await axiosInstance.post(API_ENDPOINTS.LOGIN, data);
        // const res = await axiosInstance.post("/v1/auth/login", data);
        return res.data;
    },

    registerUser: async (data) => {
        const res = await axiosPublic.post(API_ENDPOINTS.REGISTER_USER, data);
        return res.data;
    },

    verifyEmail: async (token) => {
        const res = await axiosPublic.post(`/auth/email/verify?token=${token}`);
        return res.data;
    },

    forgotPassword: async (data) => {
        const res = await axiosPublic.post(API_ENDPOINTS.FORGOT_PASSWORD, data);
        return res.data;
    },

    resetPassword: async (data) => {
        const res = await axiosPublic.post(API_ENDPOINTS.RESET_PASSWORD, data);
        return res.data;
    },

    refreshToken: async () => {
        const res = await axiosInstance.post(API_ENDPOINTS.REFRESH_TOKEN);
        return res.data;
    },

    changePassword: async (data) => {
        const res = await axiosInstance.post("/auth/change-password", data);
        return res.data;
    },

};

export default authApi;


// const authApi = {
//     async login(data) {
//         const res = await axiosInstance.post(API_ENDPOINTS.LOGIN, data);
//         return res.data;
//     }
// };

// await axios.post("/auth/login", { email: "a@gmail.com", password: "123" });
