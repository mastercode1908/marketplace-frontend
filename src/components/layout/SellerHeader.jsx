import { Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "../notification/NotificationBell";
import "../../styles/SellerHeader.css";

export default function SellerHeader() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.fullName || user?.user?.fullName || user?.seller?.user?.fullName || "Người bán";
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.user?.avatarUrl || user?.seller?.user?.avatarUrl;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <Link to="/seller/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", padding: "4px 0" }}>
          <UserOutlined style={{ fontSize: "16px" }} /> Xem hồ sơ
        </Link>
      ),
      style: {
        padding: "12px 16px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
      },
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <span
          onClick={handleLogout}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
            padding: "4px 0",
            width: "100%"
          }}
        >
          <LogoutOutlined style={{ fontSize: "16px" }} /> Đăng xuất
        </span>
      ),
      style: {
        padding: "12px 16px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
  ];

  return (
    <header className="seller-header">
      <div className="seller-header-container">
        <div className="seller-header-left">
          <Link to="/seller/dashboard" className="seller-logo">
            <ShopOutlined style={{ fontSize: "24px", color: "#008ECC" }} />
            <span className="seller-logo-text">Seller Dashboard</span>
          </Link>
        </div>

        <div className="seller-header-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <NotificationBell />
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="seller-user-info">
              <Avatar
                size={40}
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{ cursor: "pointer" }}
              />
              <span className="seller-user-name">{displayName}</span>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}




