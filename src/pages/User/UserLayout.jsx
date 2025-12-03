import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Avatar } from "antd";
import {
  UserOutlined,
  BellOutlined,
  ShoppingOutlined,
  GiftOutlined,
  EditOutlined,
  HeartOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import "../../styles/UserProfilePage.css";

export default function UserLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.fullName || user?.user?.fullName || "Người dùng";
  const avatarUrl =
    user?.avatar ||
    user?.profilePicture ||
    user?.avata ||
    user?.avatarUrl ||
    user?.data?.user?.avatarUrl ||
    user?.data?.user?.avata ||
    user?.user?.avatarUrl ||
    user?.user?.avata;

  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";

  // Xác định active menu dựa trên pathname và query param
  const getActiveMenu = () => {
    if (location.pathname.includes("/orders")) {
      return "orderHistory";
    }
    if (location.pathname.includes("/user/profile")) {
      return currentTab;
    }
    return "";
  };

  const activeMenu = getActiveMenu();

  const handleNavigate = (tab) => {
    navigate(`/user/profile?tab=${tab}`);
  };

  return (
    <div className="user-profile-page">
      <HomeHeader />
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 53px" }}>
        <div className="profile-container">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            <div className="sidebar-header">
              <Avatar size={64} src={avatarUrl} icon={<UserOutlined />} />
              <div className="user-info">
                <h3>{displayName}</h3>
                <button
                  className="edit-profile-btn"
                  onClick={() => handleNavigate("profile")}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <EditOutlined /> Sửa Hồ Sơ
                </button>
              </div>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section">
                <div
                  className={`nav-item ${activeMenu === "notifications" ? "active" : ""}`}
                  onClick={() => handleNavigate("notifications")}
                >
                  <BellOutlined className="nav-icon" />
                  <span>Thông Báo</span>
                </div>
              </div>

              <div className="nav-section">
                <div className="nav-item nav-section-title">
                  <UserOutlined className="nav-icon" />
                  <span>Tài Khoản Của Tôi</span>
                </div>
                <div className="nav-submenu">
                  <div
                    className={`nav-subitem ${activeMenu === "profile" ? "active" : ""}`}
                    onClick={() => handleNavigate("profile")}
                  >
                    Hồ Sơ
                  </div>
                  <div
                    className={`nav-subitem ${activeMenu === "address" ? "active" : ""}`}
                    onClick={() => handleNavigate("address")}
                  >
                    Địa Chỉ
                  </div>
                  <div
                    className={`nav-subitem ${activeMenu === "password" ? "active" : ""}`}
                    onClick={() => handleNavigate("password")}
                  >
                    Đổi Mật Khẩu
                  </div>
                </div>
              </div>

              <div className="nav-section">
                <div
                  className={`nav-item ${activeMenu === "wishlist" ? "active" : ""}`}
                  onClick={() => handleNavigate("wishlist")}
                >
                  <HeartOutlined className="nav-icon" />
                  <span>Wishlist</span>
                </div>
              </div>

              <div className="nav-section">
                <div
                  className={`nav-item ${activeMenu === "orderHistory" ? "active" : ""}`}
                  onClick={() => navigate("/user/orders")}
                >
                  <HistoryOutlined className="nav-icon" />
                  <span>Lịch sử đặt đơn hàng</span>
                </div>
              </div>

            </nav>
          </div>

          {/* Main Content */}
          <div className="profile-content">
            <Outlet />
          </div>
        </div>
      </div>
      <HomeFooter />
    </div >
  );
}



