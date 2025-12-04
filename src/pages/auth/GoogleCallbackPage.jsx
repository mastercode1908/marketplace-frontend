import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import authApi from "../../api/identity/authApi";
import { useAuth } from "../../hooks/useAuth";
import { ERROR_MESSAGES_VN } from "../../utils/constants";

export default function GoogleCallbackPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(null); // true/false
    const [userRole, setUserRole] = useState(null); // Track user role

    const hasShownToast = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const successParam = params.get("success");
        const errorCode = params.get("error");
        const accessToken = params.get("accessToken");
        const userId = params.get("userId");
        const email = params.get("email");
        const role = params.get("role");
        const status = params.get("status");

        setSuccess(successParam === "true");

        if (successParam === "true" && accessToken) {
            try {
                // Lưu token và user info từ URL params
                localStorage.setItem("accessToken", accessToken);

                const userData = {
                    userId: userId,
                    email: email,
                    role: role,
                    status: status
                };

                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                setUserRole(role); // Save role to state

                const msg = "Xác thực Google thành công!";
                setMessage(msg);
                if (!hasShownToast.current) {
                    toast.success(msg);
                    hasShownToast.current = true;
                }

                setLoading(false);

                // Auto-redirect cho non-BUYER roles
                const userRoleUpper = role?.toUpperCase();
                if (userRoleUpper !== "BUYER") {
                    setTimeout(() => {
                        // Nếu status INCOMPLETE, chuyển đến shop-information
                        if (status?.toUpperCase() === "INCOMPLETE") {
                            navigate("/shop-information");
                        } else {
                            console.log("Google callback - User role:", userRoleUpper);

                            if (userRoleUpper === "ADMIN" || userRoleUpper === "SYSTEMADMIN") {
                                navigate("/admin", { replace: true });
                            } else if (userRoleUpper === "SELLER") {
                                navigate("/seller/dashboard", { replace: true });
                            } else if (userRoleUpper === "CONTENTADMIN") {
                                navigate("/content-admin/dashboard", { replace: true });
                            }
                        }
                    }, 2000);
                }
                // BUYER: không auto-redirect, hiển thị nút "Tiếp tục"
            } catch (err) {
                console.error("Error saving auth data:", err);
                const msg = "Xác thực thất bại";
                setSuccess(false);
                setMessage(msg);
                toast.error(msg);
                setLoading(false);
                setTimeout(() => navigate("/login"), 3000);
            }
        } else {
            const msg = ERROR_MESSAGES_VN[errorCode] || "Xác thực thất bại!";
            setMessage(msg);

            // Only show toast if not already shown
            if (!hasShownToast.current) {
                toast.error(msg);
                hasShownToast.current = true;
            }
            setLoading(false);

            // Chuyển về login sau vài giây
            setTimeout(() => navigate("/login"), 4000);
        }
    }, [navigate, setUser]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            {loading && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 text-center max-w-xs w-full">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-gray-800">Đang xử lý</h3>
                            <p className="text-gray-600 text-sm">Đang đăng nhập với Google...</p>
                        </div>
                    </div>
                </div>
            )}
            {!loading && (
                <div className={`max-w-sm w-full rounded-xl shadow-lg overflow-hidden border ${success
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                    : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
                    }`}>
                    <div className={`p-6 text-center ${success
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                        }`}>
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${success ? "bg-white/30" : "bg-white/30"
                            } backdrop-blur-sm`}>
                            {success ? (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            )}
                        </div>

                        <h2 className="text-xl font-bold mb-2">
                            {success ? "Thành công!" : "Thất bại!"}
                        </h2>
                        <p className="text-white font-medium text-base">
                            {success ? "Xác thực tài khoản thành công" : message}
                        </p>
                    </div>

                    <div className="p-4 bg-white">
                        {!success && (
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Quay lại đăng nhập
                            </button>
                        )}
                        {success && userRole?.toUpperCase() === "BUYER" && (
                            <button
                                onClick={() => navigate("/home")}
                                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Tiếp tục
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
