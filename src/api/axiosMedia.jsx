import axios from "axios";

const axiosMedia = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
});

export default axiosMedia;