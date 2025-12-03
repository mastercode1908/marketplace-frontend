// src/api/mediaApi.js
import { API_ENDPOINTS } from "@/utils/constants";
import axiosMedia from "../axiosMedia";

const mediaApi = {
    uploadMultiple: async (formData) => {
        const res = await axiosMedia.post(API_ENDPOINTS.UPLOAD_IMAGES_VIDEOS, formData);
        return res.data;
    },

    deleteMedia: async (publicId, resourceType) => {
        const res = await axiosMedia.delete(API_ENDPOINTS.DELETE_IMAGES_VIDEOS, {
            params: { publicId, resourceType },
        });
        return res.data;
    },
    uploadSingle: async (formData) => {
        const res = await axiosMedia.post(API_ENDPOINTS.UPLOAD_IMAGES_SINGLE, formData);
        return res.data;
    },

};

export default mediaApi;
