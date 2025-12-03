import { useState } from "react";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import authApi from "../../api/identity/authApi";
import { ERROR_MESSAGES_VN } from "../../utils/constants";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const [roleType, setRoleType] = useState("BUYER"); // BUYER hoặc SELLER
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Validate frontend
    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = "Email là bắt buộc.";
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = "Email không hợp lệ.";

        if (!username) newErrors.username = "Tên đăng nhập là bắt buộc.";
        else if (username.length < 3) newErrors.username = "Tên đăng nhập phải từ 3 ký tự trở lên.";

        if (!fullName) newErrors.fullName = "Họ và tên là bắt buộc.";

        if (!password) newErrors.password = "Mật khẩu là bắt buộc.";
        else if (password.length < 6) newErrors.password = "Mật khẩu phải từ 6 ký tự trở lên.";

        if (!confirmPassword) newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
        else if (confirmPassword !== password) newErrors.confirmPassword = "Mật khẩu không khớp.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const res = await authApi.registerUser({ email, username, fullName, password, role: roleType });

            // Clear form
            setEmail("");
            setUsername("");
            setFullName("");
            setPassword("");
            setConfirmPassword("");
            setShowPassword(false);
            setShowConfirmPassword(false);
            setErrors({});

            toast.success(res.message || "Đăng ký thành công! Vui lòng xác thực email.");
        } catch (err) {
            const code = err.response?.data?.code;
            const fieldErrors = err.response?.data?.errors;

            if (fieldErrors) {
                // Set errors state để hiển thị dưới input
                // Merge backend errors vào state frontend
                setErrors(prevErrors => ({ ...prevErrors, ...fieldErrors }));
            } else {
                let message = ERROR_MESSAGES_VN[code] || "Đăng ký thất bại!";
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}auth/google/register?role=${roleType}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">MegaMart</span>
                        </h1>
                        <p className="text-sm text-slate-500">Tạo tài khoản mới</p>
                    </div>

                    {/* Role Selection */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Chọn vai trò</label>
                        <select
                            value={roleType}
                            onChange={(e) => setRoleType(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        >
                            <option value="BUYER">Người mua</option>
                            <option value="SELLER">Người bán</option>
                        </select>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.email ? "border-red-500" : "border-slate-200"}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.username ? "border-red-500" : "border-slate-200"}`}
                                />
                            </div>
                            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                            <input
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.fullName ? "border-red-500" : "border-slate-200"}`}
                            />
                            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-10 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.password ? "border-red-500" : "border-slate-200"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-10 pr-10 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.confirmPassword ? "border-red-500" : "border-slate-200"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
                        >
                            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-xs text-slate-400">hoặc</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Google Register */}
                    <button style={{ color: "red" }}
                        onClick={handleGoogleRegister}
                        className="w-full border border-slate-200 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Đăng ký với Google
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition">
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
