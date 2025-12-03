import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Youtube, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from 'antd';
import HomeHeader from '../../components/layout/HomeHeader';
import HomeFooter from '../../components/layout/HomeFooter';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <HomeHeader />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Back Button */}
                    <Link to="/home" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#008ECC] mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Về trang chủ
                    </Link>

                    {/* Page Title */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Liên Hệ Với Chúng Tôi</h1>
                        <p className="text-lg text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
                    </div>

                    {/* Content */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <Card className="shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi Tin Nhắn</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent outline-none transition"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent outline-none transition"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Chủ đề *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent outline-none transition"
                                        placeholder="Vấn đề cần hỗ trợ"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Nội dung *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent outline-none transition resize-none"
                                        placeholder="Mô tả chi tiết vấn đề của bạn..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#008ECC] text-white py-3 rounded-lg font-semibold hover:bg-[#007AB0] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Gửi Tin Nhắn
                                </button>
                            </form>
                        </Card>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            {/* Address */}
                            <Card className="shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-[#008ECC]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Địa Chỉ</h3>
                                        <p className="text-gray-600">
                                            Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ,<br />
                                            Thành Phố Thủ Đức, Thành phố Hồ Chí Minh
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Phone */}
                            <Card className="shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                        <Phone className="w-5 h-5 text-[#008ECC]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Điện Thoại</h3>
                                        <p className="text-gray-600">Hotline: <a href="tel:1900xxxx" className="text-[#008ECC] hover:underline">1900 xxxx</a></p>
                                        <p className="text-gray-600">Hỗ trợ: <a href="tel:0123456789" className="text-[#008ECC] hover:underline">0123 456 789</a></p>
                                    </div>
                                </div>
                            </Card>

                            {/* Email */}
                            <Card className="shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[#008ECC]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                                        <p className="text-gray-600">
                                            Hỗ trợ: <a href="mailto:support@marketplace.vn" className="text-[#008ECC] hover:underline">support@marketplace.vn</a>
                                        </p>
                                        <p className="text-gray-600">
                                            Hợp tác: <a href="mailto:partnership@marketplace.vn" className="text-[#008ECC] hover:underline">partnership@marketplace.vn</a>
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Social Media */}
                            <div className="bg-[#008ECC] rounded-xl shadow-lg p-6 text-white">
                                <h3 className="font-bold text-lg mb-4">Theo Dõi Chúng Tôi</h3>
                                <div className="flex gap-4">
                                    <a href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                                        <Youtube className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <Card className="shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Giờ Làm Việc</h3>
                                <div className="space-y-2 text-gray-600">
                                    <p><strong>Thứ 2 - Thứ 6:</strong> 8:00 - 18:00</p>
                                    <p><strong>Thứ 7:</strong> 8:00 - 17:00</p>
                                    <p><strong>Chủ Nhật:</strong> 9:00 - 16:00</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <HomeFooter />
        </>
    );
};

export default ContactPage;
