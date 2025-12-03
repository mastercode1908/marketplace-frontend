import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import authApi from "../../api/identity/authApi";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Validate frontend đồng bộ backend
    const validate = () => {
        const newErrors = {};

        // Password
        if (!password) newErrors.password = "Mật khẩu không được để trống.";
        else if (password.length < 8) newErrors.password = "Mật khẩu phải từ 8 ký tự trở lên.";
        else {
            if (!/[A-Z]/.test(password)) newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa.";
            else if (!/[a-z]/.test(password)) newErrors.password = "Mật khẩu phải có ít nhất 1 chữ thường.";
            else if (!/\d/.test(password)) newErrors.password = "Mật khẩu phải có ít nhất 1 số.";
            else if (!/[@$!%*?&]/.test(password)) newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&).";
        }

        // Confirm password
        if (!confirmPassword) newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống.";
        else if (confirmPassword !== password) newErrors.confirmPassword = "Mật khẩu không khớp.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        const urlToken = searchParams.get("token");
        if (urlToken) setToken(urlToken);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        if (!token || !password) {
            toast.error("Thiếu token hoặc mật khẩu mới!");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const res = await authApi.resetPassword({ token, newPassword: password });
            setMessage("Tự động chuyển về đăng nhập");
            toast.success(res.message || "Mật khẩu đã được cập nhật thành công!");

            // Sau 2 giây, quay lại trang đăng nhập
            setTimeout(() => {
                navigate("/login");
            }, 3000);

            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            const fieldErrors = err.response?.data?.errors;
            if (fieldErrors) {
                // Hiển thị lỗi dưới từng input
                setErrors(prevErrors => ({ ...prevErrors, ...fieldErrors }));
            } else {
                setMessage("Tự động chuyển về đăng nhập");
                toast.error(err.response?.data?.message || "Đặt lại mật khẩu thất bại!");

                // Sau 2 giây, quay lại trang đăng nhập
                setTimeout(() => {
                    navigate("/login");
                }, 3000);

            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Đặt lại mật khẩu
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium 
                       py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                </form>

                {message && (
                    <p className="text-center text-sm text-slate-600 mt-4">{message}</p>
                )}
            </div>
        </div>
    );
}
