import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Badge } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ProductOutlined,
  UserOutlined,
  ShopOutlined,
  HistoryOutlined,
  CrownOutlined,
  GiftOutlined,
  MessageOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/SellerLayout.css";
import chatApi from "../../api/communication/chatApi";
import chatWebSocketService from "../../services/chatWebSocketService";
import servicePackageApi from "../../api/seller/servicePackageApi";

const { Sider } = Layout;

export default function SellerSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasBannerPackage, setHasBannerPackage] = useState(false);

  const displayName = user?.fullName || user?.user?.fullName || "Người bán";
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.user?.avatarUrl;
  const userId = user?.id || user?.user?.id || user?.userId || user?.user?.userId;

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await chatApi.getConversations();
        const conversations = response.data.data || [];

        // Calculate total unread count for Seller
        const totalUnread = conversations.reduce((acc, conv) => {
          let count = 0;
          if (conv.sellerId === userId) {
            count = conv.unreadCountSeller || 0;
          } else if (conv.buyerId === userId) {
            count = conv.unreadCountBuyer || 0;
          }
          return acc + count;
        }, 0);

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Failed to fetch conversations for sidebar:", error);
      }
    };

    const checkBannerPackage = async () => {
      try {
        const myPackages = await servicePackageApi.getMyPackages();
        const packages = Array.isArray(myPackages) ? myPackages : [myPackages].filter(Boolean);

        const hasActiveBannerPkg = packages.some(pkg =>
          pkg.status === 'Active' && pkg.packageName === 'Gói Quảng Cáo Banner'
        );
        setHasBannerPackage(hasActiveBannerPkg);
      } catch (error) {
        console.error("Failed to check banner package:", error);
      }
    };

    fetchUnreadCount();
    checkBannerPackage();

    // WebSocket for real-time updates
    chatWebSocketService.connect(() => {
      chatWebSocketService.subscribe('/user/queue/messages', (message) => {
        if (message.senderId !== userId) {
          setUnreadCount(prev => prev + 1);
        }
      });
    });

    return () => {
    };
  }, [userId]);


  const menuItems = [
    {
      key: "/seller/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng Quan",
    },
    {
      key: "/seller/profile",
      icon: <UserOutlined />,
      label: "Hồ Sơ",
    },
    {
      key: "/seller/products",
      icon: <ShoppingOutlined />,
      label: "Quản Lý Sản Phẩm",
    },
    {
      key: "/seller/service-packages",
      icon: <CrownOutlined />,
      label: "Gói Dịch Vụ",
    },
    {
      key: "/seller/promotions",
      icon: <GiftOutlined />,
      label: "Mã Giảm Giá",
    },
    ...(hasBannerPackage ? [{
      key: "/seller/banners",
      icon: <PictureOutlined />,
      label: "Quản Lý Banner",
    }] : []),
    {
      key: "/seller/orders",
      icon: <HistoryOutlined />,
      label: "Lịch sử đơn hàng",
    },
    {
      key: "/user/chat",
      icon: <MessageOutlined />,
      label: (
        <span className="flex justify-between items-center w-full">
          <span>Tin nhắn</span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" />
          )}
        </span>
      ),
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Xác định selected key, bao gồm cả /orders/seller
  const selectedKey = menuItems.find((item) => {
    if (item.key === "/seller/orders") {
      return location.pathname.startsWith("/orders/seller") || location.pathname.startsWith("/seller/orders");
    }
    return location.pathname.startsWith(item.key);
  })?.key || "/seller/dashboard";

  return (
    <Sider
      collapsible
      trigger={null}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      style={{
        background: "white",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: "70px",
        height: "calc(100vh - 70px)",
        overflowY: "auto",
        zIndex: 999,
      }}
    >
      <div
        className="seller-sidebar-header"
        onClick={() => navigate("/seller/profile")}
        style={{ cursor: "pointer" }}
      >
        <Avatar size={64} src={avatarUrl} icon={<UserOutlined />} />
        {!collapsed && (
          <div className="seller-info">
            <h3>{displayName}</h3>
            <p className="seller-role">
              <ShopOutlined /> Người bán
            </p>
          </div>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: "white",
        }}
        className="seller-menu"
      />
    </Sider>
  );
}
