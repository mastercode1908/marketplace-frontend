// src/api/identity/authApi.js
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../../utils/constants";

//Tao ra 1 object, await doi muon dung dc phai co async
const shopInfoAPI = {
    shopInfo: async (data) => {
        const res = await axiosInstance.post(API_ENDPOINTS.SELLER_SHOP_INFO_ADD, data);
        // const res = await axiosInstance.post("/v1/auth/login", data);
        return res.data;
    },

};

export default shopInfoAPI;
