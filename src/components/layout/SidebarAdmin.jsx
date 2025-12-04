import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Badge } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  GiftOutlined,
  DollarOutlined,
  UserOutlined,
  BellOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/SellerLayout.css";
import chatApi from "../../api/communication/chatApi";
import chatWebSocketService from "../../services/chatWebSocketService";

const { Sider } = Layout;

export default function SidebarAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = user?.id || user?.user?.id || user?.userId || user?.user?.userId;

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await chatApi.getConversations();
        const conversations = response.data.data || [];

        // Calculate total unread count for Admin
        const totalUnread = conversations.reduce((acc, conv) => {
          let count = 0;
          // Admin có thể là buyer hoặc seller trong conversation
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

    fetchUnreadCount();

    // WebSocket for real-time updates
    chatWebSocketService.connect(() => {
      chatWebSocketService.subscribe('/user/queue/messages', (message) => {
        if (message.senderId !== userId) {
          setUnreadCount(prev => prev + 1);
        }
      });
    });

    return () => {
      // Cleanup if needed
    };
  }, [userId]);

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Tổng Quan",
    },
    {
      key: "/admin/notification",
      icon: <BellOutlined />,
      label: "Quản Lý Thông Báo",
    },
    {
      key: "/admin/servicepackage",
      icon: <ShoppingOutlined />,
      label: "Quản Lý Gói Dịch Vụ",
    },
    {
      key: "/admin/discount",
      icon: <DollarOutlined />,
      label: "Quản Lý Mã Giảm Giá",
    },
    {
      key: "/admin/categories",
      icon: <GiftOutlined />,
      label: "Quản Lý Danh Mục",
    },
    {
      key: "/admin/flash_sale",
      icon: <GiftOutlined />,
      label: "Quản Lý Flash Sale",
    },
    {
      key: "/admin/user_manage",
      icon: <UserOutlined />,
      label: "Quản Lý Người Dùng",
    },
    {
      key: "/admin/seller_review",
      icon: <CheckCircleOutlined />,
      label: "Xét Duyệt Seller",
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
    console.log("Navigating to:", key);
    navigate(key, { replace: false });
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    // Exact match first
    const exactMatch = menuItems.find((item) => path === item.key || path === `${item.key}/`);
    if (exactMatch) return exactMatch.key;
    
    // Then match by startsWith, but prefer longer matches
    const matches = menuItems
      .filter((item) => path.startsWith(item.key))
      .sort((a, b) => b.key.length - a.key.length);
    
    return matches.length > 0 ? matches[0].key : "/admin";
  };

  return (
    <Sider
      width={250}
      style={{
        background: "white",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1001,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "24px 16px",
          borderBottom: "1px solid #e8eaed",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1890ff",
            margin: 0,
          }}
        >
          MegaMart
        </h2>
        <p style={{ fontSize: "12px", color: "#8c8c8c", margin: "4px 0 0" }}>
          Admin Dashboard
        </p>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: "white",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
        className="seller-menu"
        theme="light"
      />
    </Sider>
  );
}

