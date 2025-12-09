import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authApi from "../../api/identity/authApi";
import { ERROR_MESSAGES_VN } from "../../utils/constants";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { setUser } = useAuth(); // context lưu user
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Gọi API thật
      // Response structure: ApiResponse<AuthResponse>
      // res = ApiResponse { success, message, data: AuthResponse { accessToken, user, ... }, timestamp }
      const res = await authApi.login({ email, password });

      // Kiểm tra response structure
      // authApi.login() return res.data từ axios
      // res = ApiResponse { success, message, data: AuthResponse { accessToken, user, ... }, timestamp }
      // Vậy res.data = AuthResponse { accessToken, user, ... }
      const authData = res.data || res; // res.data là AuthResponse, nếu không có thì dùng res trực tiếp

      // Lấy accessToken từ authData
      const accessToken = authData.accessToken;
      if (!accessToken) {
        console.error("Response structure:", res);
        throw new Error(
          "Không nhận được accessToken từ server. Vui lòng kiểm tra lại."
        );
      }

      // Lưu token + thông tin user vào localStorage
      localStorage.setItem("accessToken", accessToken);

      // Lưu toàn bộ authData để có thể lấy user info sau
      // authData = AuthResponse { accessToken, user: { id, username, email, ... }, ... }
      localStorage.setItem("user", JSON.stringify(authData));

      setUser(authData);
      toast.success("Đăng nhập thành công!");

      const userRole = (
        authData.user?.role ||
        authData.role ||
        authData.user?.user?.role
      )?.toUpperCase();
      console.log("User role:", userRole, "AuthData:", authData);

      // Ưu tiên check user status trước
      if (authData.status?.toUpperCase() === "INCOMPLETE") {
        navigate("/shop-information", { replace: true });
        return;
      }

      // Nếu status OK -> điều hướng theo role
      switch (userRole?.toUpperCase()) {
        case "ADMIN":
        case "SYSTEMADMIN":
          navigate("/admin", { replace: true });
          break;

        case "CONTENTADMIN":
        case "CONTENT_ADMIN":
          navigate("/content-admin/dashboard", { replace: true });
          break;

        case "SELLER":
          navigate("/seller/dashboard", { replace: true });
          break;

        case "BUYER":
          navigate("/home", { replace: true });
          break;

        default:
          console.warn("Unknown role, redirecting to home");
          navigate("/home", { replace: true });
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      const code = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || err.message;
      let message =
        ERROR_MESSAGES_VN[code] || errorMessage || "Đăng nhập thất bại!";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL
    }auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative">
      {/* Nút quay về trang chủ - góc trên cùng bên trái */}
      <Link
        to="/home"
        className="absolute top-8 left-6 inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Quay về trang chủ</span>
      </Link>

      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          {/* Logo & Branding */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                MegaMart
              </span>
            </h1>
            <p className="text-sm text-slate-500">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <a
                  href="/forgot"
                  className="text-xs text-blue-600 hover:text-blue-700 transition"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400">hoặc</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-slate-300 bg-white text-slate-700 font-medium py-2 rounded-lg 
               hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8c-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.2 1.2 8.5 3.3l5.7-5.7C34.6 5.1 29.6 3 24 3C12.9 3 4 11.9 4 23s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.9C14.7 15.5 18.9 12 24 12c3.2 0 6.2 1.2 8.5 3.3l5.7-5.7C34.6 5.1 29.6 3 24 3C16.5 3 10.2 7.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 43c5.2 0 10-2 13.5-5.3l-6.2-5.1c-2.1 1.4-4.7 2.3-7.3 2.3c-5.4 0-10-3.5-11.6-8.3l-6.5 5C9.9 38.7 16.5 43 24 43z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.8 5.1l6.2 5.1C40.6 33.8 44 28.8 44 23c0-1.3-.1-2.5-.4-3.5z"
              />
            </svg>

            <span className="text-[15px] font-medium tracking-wide">
              Đăng nhập với Google
            </span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import authApi from "../../api/identity/authApi";

// export default function LoginPage() {
//     const { setUser } = useAuth();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await authApi.login({ email, password });

//             // Lưu token + user info
//             localStorage.setItem("accessToken", res.accessToken);
//             localStorage.setItem("user", JSON.stringify(res));

//             // Cập nhật context
//             setUser(res);

//             alert("Đăng nhập thành công!");
//         } catch (err) {
//             alert("Đăng nhập thất bại!");
//             console.error(err);
//         }
//     };

//     return (
//         <form onSubmit={handleLogin}>
//             <h2>Đăng nhập</h2>
//             <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//                 type="password"
//                 placeholder="Mật khẩu"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />
//             <button type="submit">Đăng nhập</button>
//         </form>
//     );
// }
