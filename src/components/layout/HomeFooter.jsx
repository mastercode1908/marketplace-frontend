import { Link } from "react-router-dom";
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, YoutubeOutlined } from "@ant-design/icons";

export default function HomeFooter() {
  return (
    <footer className="home-footer" style={{ background: '#008ECC' }}>
      <div className="container mx-auto px-4 md:px-[54px] py-12" style={{ maxWidth: '1440px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>Về MegaMart</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Giới thiệu</Link></li>
              <li><Link to="/careers" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Tuyển dụng</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Liên hệ</Link></li>
              <li><Link to="/news" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Tin tức</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Câu hỏi thường gặp</Link></li>
              <li><Link to="/shipping" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Chính sách vận chuyển</Link></li>
              <li><Link to="/return" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Chính sách đổi trả</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>Thanh toán</h3>
            <ul className="space-y-2">
              <li><Link to="/payment" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Phương thức thanh toán</Link></li>
              <li><Link to="/installment" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Trả góp</Link></li>
              <li><Link to="/voucher" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Mã giảm giá</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>Theo dõi chúng tôi</h3>
            <div className="flex gap-4 mb-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>
                <FacebookOutlined />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>
                <TwitterOutlined />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>
                <InstagramOutlined />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>
                <YoutubeOutlined />
              </a>
            </div>
            <p className="text-sm" style={{ color: '#FFFFFF' }}>Hotline: 1900 1234</p>
            <p className="text-sm" style={{ color: '#FFFFFF' }}>Email: support@megamart.com</p>
          </div>
        </div>

        <div className="border-t pt-8" style={{ borderColor: '#05ABF3' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0" style={{ color: '#FFFFFF' }}>
              © 2025 MegaMart. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Điều khoản sử dụng</Link>
              <Link to="/privacy" className="text-sm hover:text-[#05ABF3] transition" style={{ color: '#FFFFFF' }}>Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
