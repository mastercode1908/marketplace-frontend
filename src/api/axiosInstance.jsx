import axios from "axios";

// # cấu hình axios (1 file duy nhất)
// Tất cả API con (identity, catalog, commerce...) import cái này để gọi backend.

// axios.create() tạo một instance Axios riêng với cấu hình mặc định.
// baseURL: mọi request sẽ tự động thêm tiền tố URL này, ví dụ:
// axiosInstance.get("/products");
// => GET http://localhost:8080/api/v1/products


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // nếu dùng JWT cookie sẽ gửi cookie kèm request.
});

// interceptor tự động thêm token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor: xử lý 401 → gọi refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if user had a token (was authenticated)
        const hadToken = localStorage.getItem("accessToken");

        // Nếu lỗi là 401 (Unauthorized) và chưa retry và có token
        if (error.response?.status === 401 && !originalRequest._retry && hadToken) {
            originalRequest._retry = true;
            try {
                // Gọi API refresh token
                const res = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}auth/refresh`,
                    {}, // body trống, vì token nằm trong cookie
                    { withCredentials: true }
                );

                // Lưu accessToken mới
                const newAccessToken = res.data.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);

                // Gắn token mới vào header và gọi lại request cũ
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token thất bại:", refreshError);
                // Nếu refresh lỗi → xóa token + logout user
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/login"; // chuyển về trang login
            }
        }

        // Các lỗi khác vẫn throw bình thường (không redirect nếu là guest)
        return Promise.reject(error);
    }
);

export default axiosInstance;


// Interceptor request cho phép bạn chèn logic trước khi gửi request.
// Ở đây:
//     Lấy token JWT từ localStorage.
//     Nếu có token, thêm header Authorization: Bearer < token > tự động.
// Nhờ vậy, không cần thêm header thủ công cho mỗi request.
