import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authApi from "../../api/identity/authApi";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Đang xác thực...");
    const token = searchParams.get("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus("Token không hợp lệ!");
            return;
        }

        const verify = async () => {
            try {

                // delay 1s để chắc chắn backend đã lưu user/token
                await new Promise(res => setTimeout(res, 2000))

                const res = await authApi.verifyEmail(token); // gọi đúng API
                setStatus(res.message || "Xác thực thành công!");

                // redirect sau 2s về login hoặc trang khác
                setTimeout(() => navigate("/login"), 2000);
            } catch (err) {
                setStatus(err.response?.data?.message || "Xác thực thất bại!");
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-xl font-bold mb-4">Thông báo xác thực</h1>
                <p className="text-slate-700">{status}</p>
            </div>
        </div>
    );
}
