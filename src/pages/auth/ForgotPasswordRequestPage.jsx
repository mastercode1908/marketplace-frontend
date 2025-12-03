import { useState } from "react";
import { Mail } from "lucide-react";
import authApi from "../../api/identity/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordRequestPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();


    // Validate frontend đồng bộ backend
    const validate = () => {
        const newErrors = {};

        // Email
        if (!email) newErrors.email = "Email không được để trống.";
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = "Email không hợp lệ.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setMessage("");

        try {
            const res = await authApi.forgotPassword({ email });
            setEmail("")
            setMessage("Tự động chuyển về đăng nhập");
            toast.success(res.message || "Email đặt lại mật khẩu đã được gửi!")

            // Sau 2 giây, quay lại trang đăng nhập
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setEmail("")
            setMessage("Tự động chuyển về đăng nhập");
            toast.error(err.response?.data?.message || "Không thể gửi email. Vui lòng thử lại!")
            // Sau 2 giây, quay lại trang đăng nhập
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Quên mật khẩu
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={20} />
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-medium py-2.5 rounded-lg transition 
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
                    </button>
                </form>
                <p style={{ marginTop: "15px" }} className="text-center text-sm text-slate-600">
                    Đã có tài khoản?{" "}
                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition">
                        Đăng nhập
                    </a>
                </p>
                {message && (
                    <p className="text-center text-sm text-slate-600 mt-4">{message}</p>
                )}
            </div>
        </div>
    );
}
