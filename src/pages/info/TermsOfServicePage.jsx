import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, Ban, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card } from 'antd';
import HomeHeader from '../../components/layout/HomeHeader';
import HomeFooter from '../../components/layout/HomeFooter';

const TermsOfServicePage = () => {
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
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Điều Khoản Dịch Vụ</h1>
                        <p className="text-lg text-gray-600">Quy định sử dụng nền tảng</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Introduction */}
                        <Card className="shadow-sm bg-yellow-50">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Bằng cách sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau đây.
                                    Vui lòng đọc kỹ trước khi sử dụng.
                                </p>
                            </div>
                        </Card>

                        {/* Section 1 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileText className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">1. Điều Khoản Chung</h2>
                            </div>
                            <div className="text-gray-700 space-y-3">
                                <p>Khi sử dụng nền tảng, bạn cam kết:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Cung cấp thông tin chính xác và đầy đủ</li>
                                    <li>Bảo mật thông tin đăng nhập của bạn</li>
                                    <li>Tuân thủ pháp luật Việt Nam</li>
                                    <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                                    <li>Chịu trách nhiệm về mọi hoạt động trên tài khoản</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 2 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Scale className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">2. Quyền và Trách Nhiệm Người Mua</h2>
                            </div>
                            <div className="text-gray-700 space-y-3">
                                <p><strong>Quyền lợi:</strong></p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Được bảo vệ thông tin cá nhân</li>
                                    <li>Được hoàn tiền nếu sản phẩm không đúng mô tả</li>
                                    <li>Khiếu nại và giải quyết tranh chấp</li>
                                    <li>Đánh giá và nhận xét sản phẩm</li>
                                </ul>
                                <p className="mt-4"><strong>Trách nhiệm:</strong></p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Thanh toán đầy đủ và đúng hạn</li>
                                    <li>Cung cấp địa chỉ giao hàng chính xác</li>
                                    <li>Kiểm tra sản phẩm khi nhận hàng</li>
                                    <li>Không lạm dụng quyền khiếu nại</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 3 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Scale className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">3. Quyền và Trách Nhiệm Người Bán</h2>
                            </div>
                            <div className="text-gray-700 space-y-3">
                                <p><strong>Quyền lợi:</strong></p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Đăng bán sản phẩm hợp pháp</li>
                                    <li>Nhận thanh toán sau khi giao hàng thành công</li>
                                    <li>Quản lý cửa hàng và sản phẩm</li>
                                </ul>
                                <p className="mt-4"><strong>Trách nhiệm:</strong></p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Đảm bảo sản phẩm chính hãng, chất lượng</li>
                                    <li>Mô tả sản phẩm chính xác, đầy đủ</li>
                                    <li>Giao hàng đúng hạn và đúng quy cách</li>
                                    <li>Xử lý khiếu nại và hoàn trả hợp lý</li>
                                    <li>Không bán hàng giả, hàng cấm</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 4 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Ban className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">4. Hành Vi Bị Cấm</h2>
                            </div>
                            <div className="text-gray-700 space-y-2">
                                <p>Nghiêm cấm các hành vi sau:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Bán hàng giả, hàng nhái, hàng lậu</li>
                                    <li>Lừa đảo, gian lận trong giao dịch</li>
                                    <li>Spam, quấy rối người dùng khác</li>
                                    <li>Hack, phá hoại hệ thống</li>
                                    <li>Đăng nội dung vi phạm pháp luật</li>
                                    <li>Tạo nhiều tài khoản để gian lận</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 5 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Xử Lý Vi Phạm</h2>
                            <div className="text-gray-700 space-y-2">
                                <p>Tùy mức độ vi phạm, chúng tôi có quyền:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Cảnh cáo:</strong> Vi phạm nhẹ lần đầu</li>
                                    <li><strong>Khóa tạm thời:</strong> Vi phạm trung bình hoặc tái phạm</li>
                                    <li><strong>Khóa vĩnh viễn:</strong> Vi phạm nghiêm trọng</li>
                                    <li><strong>Báo cơ quan chức năng:</strong> Vi phạm pháp luật</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 6 */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Giới Hạn Trách Nhiệm</h2>
                            <div className="text-gray-700">
                                <p>Chúng tôi không chịu trách nhiệm về:</p>
                                <ul className="list-disc pl-5 space-y-2 mt-2">
                                    <li>Chất lượng sản phẩm do người bán cung cấp</li>
                                    <li>Tranh chấp trực tiếp giữa người mua và người bán</li>
                                    <li>Thiệt hại do lỗi kỹ thuật bất khả kháng</li>
                                    <li>Thông tin sai lệch do người dùng cung cấp</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Contact */}
                        <div className="bg-blue-50 rounded-xl p-6 mt-8">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Điều Khoản Có Thể Thay Đổi</h3>
                            <p className="text-gray-700">
                                Chúng tôi có quyền cập nhật điều khoản này bất kỳ lúc nào.
                                Phiên bản mới sẽ có hiệu lực ngay khi đăng tải.
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

export default TermsOfServicePage;
