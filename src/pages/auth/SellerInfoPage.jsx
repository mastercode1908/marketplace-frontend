import { useEffect, useRef, useState } from "react";
import { Store, MapPin, FileText, BadgePercent } from "lucide-react";
import shopInfoAPI from "../../api/identity/ShopInfoApi";
import { ERROR_MESSAGES_VN } from "../../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SellerInfoPage() {
    const [shopName, setShopName] = useState("");
    const [shopAddress, setShopAddress] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [taxCode, setTaxCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const hasShownToast = useRef(false);
    const navigate = useNavigate();
    // Validate form tiếng Việt
    const validate = () => {
        const newErrors = {};

        if (!shopName.trim()) newErrors.shopName = "Tên cửa hàng không được để trống.";
        else if (shopName.length < 3 || shopName.length > 50)
            newErrors.shopName = "Tên cửa hàng phải từ 3 đến 50 ký tự.";

        if (!shopAddress.trim()) newErrors.shopAddress = "Địa chỉ cửa hàng không được để trống.";

        if (!shopDescription.trim())
            newErrors.shopDescription = "Mô tả cửa hàng không được để trống.";
        else if (shopDescription.length < 10)
            newErrors.shopDescription = "Mô tả phải ít nhất 10 ký tự.";

        if (taxCode && !/^[0-9]{10,13}$/.test(taxCode))
            newErrors.taxCode = "Mã số thuế không hợp lệ (phải là 10–13 chữ số).";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Gửi dữ liệu
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const payload = {
                shopName,
                shopAddress,
                shopDescription,
                taxCode: taxCode || null,
            };
            const res = await shopInfoAPI.shopInfo(payload);
            setShopName("")
            setShopAddress("")
            setShopDescription("")
            setTaxCode("")
            setErrors("")

            toast.success(res.message || "Hoàn tất thông tin cửa hàng thành công!");
            // Có thể điều hướng sang dashboard
            // window.location.href = "/seller_dashboard";
        } catch (err) {
            const code = err.response?.data?.code;
            let message =
                ERROR_MESSAGES_VN[code] ||
                "Đã xảy ra lỗi khi lưu thông tin cửa hàng.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!hasShownToast.current) {
            toast("Bạn vui lòng điền thêm thông tin về cửa hàng!");
            hasShownToast.current = true;
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                MegaMart
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500">
                            Hoàn tất thông tin cửa hàng để bắt đầu kinh doanh
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Shop Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Tên cửa hàng
                            </label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Shop Hoa Tươi Lily"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.shopName ? "border-red-500" : "border-slate-200"}`}
                                />
                            </div>
                            {errors.shopName && (
                                <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>
                            )}
                        </div>

                        {/* Shop Address */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Địa chỉ cửa hàng
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                                    value={shopAddress}
                                    onChange={(e) => setShopAddress(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.shopAddress ? "border-red-500" : "border-slate-200"}`}
                                />
                            </div>
                            {errors.shopAddress && (
                                <p className="text-xs text-red-500 mt-1">{errors.shopAddress}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Mô tả cửa hàng
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    rows="3"
                                    placeholder="Giới thiệu ngắn gọn về sản phẩm hoặc dịch vụ của bạn..."
                                    value={shopDescription}
                                    onChange={(e) => setShopDescription(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none ${errors.shopDescription ? "border-red-500" : "border-slate-200"}`}
                                ></textarea>
                            </div>
                            {errors.shopDescription && (
                                <p className="text-xs text-red-500 mt-1">{errors.shopDescription}</p>
                            )}
                        </div>

                        {/* Tax Code (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Mã số thuế (tuỳ chọn)
                            </label>
                            <div className="relative">
                                <BadgePercent className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="VD: 0312345678"
                                    value={taxCode}
                                    onChange={(e) => setTaxCode(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${errors.taxCode ? "border-red-500" : "border-slate-200"}`}
                                />
                            </div>
                            {errors.taxCode && (
                                <p className="text-xs text-red-500 mt-1">{errors.taxCode}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
                        >
                            {isLoading ? "Đang lưu..." : "Hoàn tất thông tin"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="w-full border-2 border-blue-600 text-blue-600 font-medium py-2 rounded-lg transition transform hover:bg-blue-600 hover:text-white hover:scale-105"
                        >
                            Quay về đăng nhập
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
