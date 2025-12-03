import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Award, Heart, ArrowLeft } from 'lucide-react';
import { Card } from 'antd';
import HomeHeader from '../../components/layout/HomeHeader';
import HomeFooter from '../../components/layout/HomeFooter';

const AboutPage = () => {
    return (
        <>
            <HomeHeader />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-5xl mx-auto px-4">
                    {/* Back Button */}
                    <Link to="/home" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#008ECC] mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Về trang chủ
                    </Link>

                    {/* Page Title */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Giới Thiệu Về MegaMart</h1>
                        <p className="text-lg text-gray-600">Kết nối người mua và người bán trên toàn quốc</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Mission Section */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                    <Target className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Sứ Mệnh</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Chúng tôi xây dựng một nền tảng thương mại điện tử hiện đại, kết nối hàng triệu người mua và người bán
                                        trên khắp Việt Nam. Với công nghệ tiên tiến và dịch vụ tận tâm, chúng tôi cam kết mang đến trải nghiệm
                                        mua sắm trực tuyến an toàn, tiện lợi và đáng tin cậy nhất.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Vision Section */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                    <Award className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Tầm Nhìn</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Trở thành nền tảng thương mại điện tử hàng đầu Việt Nam, nơi mọi người có thể dễ dàng mua bán
                                        mọi thứ họ cần. Chúng tôi không ngừng đổi mới và phát triển để đáp ứng nhu cầu ngày càng cao của
                                        khách hàng trong kỷ nguyên số.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Values Section */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                    <Heart className="w-6 h-6 text-[#008ECC]" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Giá Trị Cốt Lõi</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-bold text-gray-900 mb-2">Tin Cậy</h3>
                                            <p className="text-sm text-gray-600">Bảo vệ quyền lợi người dùng là ưu tiên hàng đầu</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-bold text-gray-900 mb-2">Nhanh Chóng</h3>
                                            <p className="text-sm text-gray-600">Giao dịch nhanh chóng, hỗ trợ 24/7</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-bold text-gray-900 mb-2">Chất Lượng</h3>
                                            <p className="text-sm text-gray-600">Đảm bảo sản phẩm chính hãng, chất lượng cao</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-bold text-gray-900 mb-2">Tận Tâm</h3>
                                            <p className="text-sm text-gray-600">Luôn lắng nghe và phục vụ khách hàng tốt nhất</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="text-3xl font-bold text-[#008ECC] mb-1">1M+</div>
                                <div className="text-sm text-gray-600">Người dùng</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="text-3xl font-bold text-[#008ECC] mb-1">500K+</div>
                                <div className="text-sm text-gray-600">Sản phẩm</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="text-3xl font-bold text-[#008ECC] mb-1">10K+</div>
                                <div className="text-sm text-gray-600">Người bán</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                                <div className="text-3xl font-bold text-[#008ECC] mb-1">99.9%</div>
                                <div className="text-sm text-gray-600">Hài lòng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <HomeFooter />
        </>
    );
};

export default AboutPage;
