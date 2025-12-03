import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

// Hook tái sử dụng để gọi API
export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        axiosInstance.get(url)
            .then((res) => mounted && setData(res.data))
            .catch(console.error)
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, [url]);

    return { data, loading };
};


// 🔹 Tổng kết
// useFetch(url) = cách tiện lợi để fetch dữ liệu API trong functional component.
// Tự động:
// Quản lý state data và loading.
// Xử lý component unmount.
// Log lỗi.
// Giúp code sạch hơn, không phải viết useEffect + axios lặp lại nhiều lần.