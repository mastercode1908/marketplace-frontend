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
                    <button
                        onClick={handleGoogleRegister}
                        className="w-full border border-slate-300 bg-white text-slate-700 
               font-medium py-2 rounded-lg flex items-center justify-center gap-2
               hover:bg-gray-50 transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48"> {/* icon chỉ tăng 1 size so với cũ */}
                            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8c-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.2 1.2 8.5 3.3l5.7-5.7C34.6 5.1 29.6 3 24 3C12.9 3 4 11.9 4 23s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
                            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.7 15.5 18.9 12 24 12c3.2 0 6.2 1.2 8.5 3.3l5.7-5.7C34.6 5.1 29.6 3 24 3C16.5 3 10.2 7.3 6.3 14.7z" />
                            <path fill="#4CAF50" d="M24 43c5.2 0 10-2 13.5-5.3l-6.2-5.1c-2.1 1.4-4.7 2.3-7.3 2.3c-5.4 0-10-3.5-11.6-8.3l-6.5 5C9.9 38.7 16.5 43 24 43z" />
                            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.8 5.1l6.2 5.1C40.6 33.8 44 28.8 44 23c0-1.3-.1-2.5-.4-3.5z" />
                        </svg>

                        <span className="text-[15px] font-medium">Đăng ký với Google</span>
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
