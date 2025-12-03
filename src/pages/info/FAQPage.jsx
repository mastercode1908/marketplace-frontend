import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Collapse } from 'antd';
import HomeHeader from '../../components/layout/HomeHeader';
import HomeFooter from '../../components/layout/HomeFooter';
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { CreditCard } from "lucide-react";
import { Package, Truck } from "lucide-react";
import { RefreshCw, Repeat } from "lucide-react";
import { User } from "lucide-react"
const { Panel } = Collapse;

const FAQPage = () => {
    const faqs = [
        {
            category: (
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Mua Hàng</span>
                </div>
            ),
            questions: [
                {
                    q: "Làm thế nào để đặt hàng?",
                    a: "Bạn có thể chọn sản phẩm, thêm vào giỏ hàng, sau đó tiến hành thanh toán. Làm theo hướng dẫn trên màn hình để hoàn tất đơn hàng."
                },
                {
                    q: "Có thể hủy đơn hàng không?",
                    a: "Bạn có thể hủy đơn hàng trong vòng 24h sau khi đặt nếu người bán chưa xác nhận. Vào 'Đơn hàng của tôi' và chọn 'Hủy đơn'."
                },
                {
                    q: "Khi nào tôi nhận được hàng?",
                    a: "Thời gian giao hàng phụ thuộc vào người bán và địa chỉ của bạn. Thông thường từ 2-7 ngày làm việc. Bạn có thể theo dõi đơn hàng trong mục 'Đơn hàng của tôi'."
                }
            ]
        },
        {
            category: (
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Thanh Toán</span>
                </div>
            ),
            questions: [
                {
                    q: "Có những phương thức thanh toán nào?",
                    a: "Chúng tôi hỗ trợ: Thanh toán khi nhận hàng (COD), thẻ ATM/Visa/Mastercard, ví điện tử (Momo, ZaloPay, VNPay), chuyển khoản ngân hàng."
                },
                {
                    q: "Thanh toán có an toàn không?",
                    a: "Tất cả giao dịch được bảo mật bằng công nghệ mã hóa SSL. Thông tin thẻ của bạn không được lưu trên hệ thống của chúng tôi."
                },
                {
                    q: "Khi nào tiền được hoàn lại?",
                    a: "Tiền được hoàn lại trong vòng 7-14 ngày làm việc sau khi đơn hàng bị hủy hoặc trả hàng được chấp nhận."
                }
            ]
        },
        {
            category: (
                <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Vận Chuyển</span>
                </div>
            ),
            questions: [
                {
                    q: "Phí vận chuyển là bao nhiêu?",
                    a: "Phí ship phụ thuộc vào trọng lượng, kích thước và địa chỉ giao hàng. Bạn sẽ thấy phí chính xác trước khi thanh toán. Một số sản phẩm có freeship."
                },
                {
                    q: "Có giao hàng toàn quốc không?",
                    a: "Có! Chúng tôi giao hàng đến tất cả tỉnh thành Việt Nam. Thời gian giao hàng có thể khác nhau tùy khu vực."
                },
                {
                    q: "Làm sao để theo dõi đơn hàng?",
                    a: "Vào 'Tài khoản' > 'Đơn hàng của tôi'. Bạn sẽ thấy trạng thái và mã vận đơn để tra cứu trên website đơn vị vận chuyển."
                }
            ]
        },
        {
            category: (
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Đổi Trả Hàng</span>
                </div>
            ),
            questions: [
                {
                    q: "Chính sách đổi trả như thế nào?",
                    a: "Bạn có thể đổi/trả hàng trong vòng 7 ngày nếu sản phẩm lỗi, sai mô tả hoặc không đúng như đơn hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng."
                },
                {
                    q: "Ai chịu phí ship khi đổi trả?",
                    a: "Nếu lỗi do người bán (sai hàng, hàng lỗi), người bán chịu phí. Nếu bạn đổi ý, bạn sẽ chịu phí ship."
                },
                {
                    q: "Làm thế nào để yêu cầu đổi trả?",
                    a: "Vào 'Đơn hàng của tôi', chọn đơn cần đổi/trả, nhấn 'Yêu cầu trả hàng/hoàn tiền', điền lý do và chờ người bán xử lý."
                }
            ]
        },
        {
            category: (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Tài Khoản</span>
                </div>
            ),
            questions: [
                {
                    q: "Làm sao để đăng ký tài khoản?",
                    a: "Nhấn 'Đăng ký' ở góc trên, điền email/số điện thoại và mật khẩu. Xác nhận qua email/SMS và hoàn tất!"
                },
                {
                    q: "Quên mật khẩu thì làm sao?",
                    a: "Nhấn 'Quên mật khẩu' ở trang đăng nhập, nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu."
                },
                {
                    q: "Có thể xóa tài khoản không?",
                    a: "Có. Vào 'Cài đặt' > 'Bảo mật' > 'Xóa tài khoản'. Lưu ý: Tất cả dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục."
                }
            ]
        }
    ];

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
                        <h1 className="text-4xl font-bold text-gray-900  mb-3">Câu Hỏi Thường Gặp</h1>
                        <p className="text-lg text-gray-600">Tìm câu trả lời cho thắc mắc của bạn</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {faqs.map((category, catIndex) => (
                            <Card key={catIndex} title={category.category} className="shadow-sm hover:shadow-md transition-shadow" headStyle={{ color: '#008ECC', fontWeight: 'bold', fontSize: '18px' }}>
                                <Collapse ghost expandIconPosition="end">
                                    {category.questions.map((faq, qIndex) => (
                                        <Panel header={faq.q} key={`${catIndex}-${qIndex}`} className="font-medium text-gray-700">
                                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                                {faq.a}
                                            </p>
                                        </Panel>
                                    ))}
                                </Collapse>
                            </Card>
                        ))}
                    </div>

                    {/* Still Have Questions */}
                    <div className="mt-12 bg-[#008ECC] text-white rounded-xl p-8 text-center shadow-lg">
                        <h3 className="text-2xl font-bold mb-2">Vẫn còn thắc mắc?</h3>
                        <p className="text-blue-100 mb-6">
                            Đội ngũ hỗ trợ của chúng tôi luônn sẵn sàng giúp đỡ bạn!
                        </p>
                        <Link
                            to="/contact"
                            className="inline-block bg-white text-[#008ECC] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
                        >
                            Liên Hệ Hỗ Trợ
                        </Link>
                    </div>
                </div>
            </div>
            <HomeFooter />
        </>
    );
};

export default FAQPage;
