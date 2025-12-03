import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Eye, Shield, Cookie, Lock, ArrowLeft } from 'lucide-react';
import { Card } from 'antd';
import HomeHeader from '../../components/layout/HomeHeader';
import HomeFooter from '../../components/layout/HomeFooter';

const PrivacyPolicyPage = () => {
    return (
        <>
            <HomeHeader />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Back Button */}
                    <Link to="/home" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#008ECC] mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Về trang chủ
                    </Link>

                    {/* Page Title */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Chính Sách Bảo Mật</h1>
                        <p className="text-lg text-gray-600">Cam kết bảo vệ thông tin cá nhân của bạn</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Introduction */}
                        <Card className="shadow-sm">
                            <p className="text-gray-700 leading-relaxed">
                                Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi
                                thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
                            </p>
                        </Card>

                        {/* Section 1 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Database className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">1. Thu Thập Thông Tin</h2>
                            </div>
                            <div className="space-y-3 text-gray-700">
                                <p><strong>Thông tin bạn cung cấp:</strong></p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Họ tên, địa chỉ email, số điện thoại</li>
                                    <li>Địa chỉ giao hàng và thanh toán</li>
                                    <li>Thông tin tài khoản ngân hàng (được mã hóa)</li>
                                    <li>Lịch sử giao dịch và đơn hàng</li>
                                </ul>
                                <p className="mt-4"><strong>Thông tin tự động thu thập:</strong></p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Địa chỉ IP, loại thiết bị, trình duyệt</li>
                                    <li>Cookies và dữ liệu theo dõi</li>
                                    <li>Hành vi sử dụng website</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 2 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Eye className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">2. Sử Dụng Thông Tin</h2>
                            </div>
                            <div className="text-gray-700 space-y-2">
                                <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Xử lý đơn hàng và giao dịch</li>
                                    <li>Gửi thông báo về đơn hàng và dịch vụ</li>
                                    <li>Cải thiện trải nghiệm người dùng</li>
                                    <li>Phân tích và nghiên cứu thị trường</li>
                                    <li>Phát hiện và ngăn chặn gian lận</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 3 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Shield className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">3. Bảo Vệ Thông Tin</h2>
                            </div>
                            <div className="text-gray-700 space-y-2">
                                <p>Chúng tôi áp dụng các biện pháp bảo mật:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Mã hóa SSL/TLS cho mọi giao dịch</li>
                                    <li>Tường lửa và hệ thống phát hiện xâm nhập</li>
                                    <li>Kiểm tra bảo mật định kỳ</li>
                                    <li>Giới hạn quyền truy cập nhân viên</li>
                                    <li>Sao lưu dữ liệu thường xuyên</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 4 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Cookie className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">4. Cookies</h2>
                            </div>
                            <div className="text-gray-700 space-y-2">
                                <p>Chúng tôi sử dụng cookies để:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Ghi nhớ thông tin đăng nhập</li>
                                    <li>Lưu giỏ hàng của bạn</li>
                                    <li>Phân tích lưu lượng truy cập</li>
                                    <li>Cá nhân hóa nội dung</li>
                                </ul>
                                <p className="mt-3">Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đúng.</p>
                            </div>
                        </Card>

                        {/* Section 5 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Lock className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">5. Quyền Của Bạn</h2>
                            </div>
                            <div className="text-gray-700 space-y-2">
                                <p>Bạn có quyền:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Truy cập và xem thông tin cá nhân</li>
                                    <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                                    <li>Xóa tài khoản và dữ liệu</li>
                                    <li>Từ chối email marketing</li>
                                    <li>Khiếu nại về việc xử lý dữ liệu</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Contact */}
                        <div className="bg-blue-50 rounded-xl p-6 mt-8">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Liên Hệ</h3>
                            <p className="text-gray-700">
                                Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
                                <a href="mailto:privacy@marketplace.vn" className="text-[#008ECC] font-medium ml-1 hover:underline">privacy@marketplace.vn</a>
                            </p>
                        </div>

                        {/* Last Updated */}
                        <div className="text-center text-xs text-gray-400 pt-6">
                            Cập nhật lần cuối: Tháng 12, 2024
                        </div>
                    </div>
                </div>
            </div>
            <HomeFooter />
        </>
    );
};

export default PrivacyPolicyPage;
