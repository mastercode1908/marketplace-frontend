/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Badge, Dropdown, List, Button, Space, Typography, Modal } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import arraySupport from "dayjs/plugin/arraySupport";
dayjs.extend(arraySupport);
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAuth } from "../../hooks/useAuth";
import notificationApi from "../../api/communication/NotificationApi";
import "./NotificationBell.css";

const { Text } = Typography;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { user } = useAuth();

  const isAdmin = () => {
    const userRole = (user?.user?.role || user?.role)?.toUpperCase();
    return userRole === "ADMIN" || userRole === "SYSTEMADMIN";
  };

  // --- WebSocket URL ---
  const getWebSocketUrl = () => {
    if (isAdmin()) return null;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    let baseUrl = apiBaseUrl.replace("http://", "ws://").replace("https://", "wss://");
    baseUrl = baseUrl.replace("/api", "").replace(/\/+$/, "");
    return `${baseUrl}/ws/notifications`;
  };

  // --- Helper ---
  const normalizeNotification = (n) => {
    // Extract ID safely, handling 0 as a valid ID
    const rawId = n.id ?? n.notificationId ?? n.notification_id;
    const safeId = rawId !== undefined && rawId !== null
      ? String(rawId)
      : `temp-${Date.now()}-${Math.random()}`;

    // Parse date safely
    let createdAt = n.createdAt || n.created_at || n.timestamp;

    let timestamp = null;
    if (createdAt) {
      const parsed = dayjs(createdAt);
      if (parsed.isValid()) {
        timestamp = parsed.valueOf();
      }
    }

    // Check both isRead (new) and is_Read (old) for backward compatibility
    const isRead = n.isRead === true || n.isRead === "true" ||
      n.is_Read === true || n.is_Read === "true" ||
      n.read === true || n.read === "true";

    return {
      ...n,
      id: safeId,
      realId: rawId,
      title: n.title,
      message: n.message || n.content,
      read: isRead,
      createdAt: timestamp,
    };
  };

  // --- API Handlers ---
  const fetchNotifications = async () => {
    if (isAdmin()) {
      return;
    }
    try {
      setLoading(true);
      const res = await notificationApi.getUserNotifications();

      let rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      let notificationsData = rawData.map(normalizeNotification);

      // sort giảm dần theo createdAt (timestamp)
      notificationsData.sort((a, b) => {
        const tA = a.createdAt || 0;
        const tB = b.createdAt || 0;
        return tB - tA;
      });

      setNotifications(notificationsData.slice(0, 10));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (isAdmin()) return;
    try {
      const res = await notificationApi.getUnreadCount();
      let count = 0;
      if (typeof res.data === "number") count = res.data;
      else if (res.data && typeof res.data === "object")
        count = res.data.count || res.data.unreadCount || res.data.data || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    // Allow 0 as valid ID, but block null/undefined/temp
    if (notificationId === undefined || notificationId === null || String(notificationId).startsWith("temp-")) {
      return;
    }

    // Optimistic update
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationApi.markAsRead(notificationId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error("markAsRead error:", error);
      toast.error("Không thể đánh dấu thông báo là đã đọc");
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      toast.error("Không thể đánh dấu tất cả là đã đọc");
    }
  };

  const handleHideReadNotifications = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    try {
      await notificationApi.hideRead();
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success("Đã xóa tất cả thông báo đã đọc");
    } catch {
      toast.error("Không thể xóa thông báo đã đọc");
    }
  };

  const handleViewDetail = async (notification) => {
    setSelectedNotification(notification);
    setDetailVisible(true);
    // Dropdown stays open so user can see the list

    if (!notification.read && notification.id && !String(notification.id).startsWith("temp-")) {
      try {
        await notificationApi.markAsRead(notification.id);
        await fetchNotifications();
        await fetchUnreadCount();
      } catch (error) {
        console.error("markAsRead error:", error);
      }
    }
  };

  // --- WebSocket Handler ---
  const handleWebSocketMessage = (data) => {
    if (data.type === "NOTIFICATION") {
      const newNotification = normalizeNotification({
        ...data.payload,
        createdAt: data.payload.createdAt || data.payload.created_at || Date.now(),
      });

      // cập nhật state
      setNotifications(prev => {
        // Add new item, then sort everything to be safe
        const updated = [newNotification, ...prev];
        updated.sort((a, b) => {
          const tA = a.createdAt || 0;
          const tB = b.createdAt || 0;
          return tB - tA;
        });

        // Remove duplicates if any (by ID)
        const unique = updated.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );

        return unique.slice(0, 10);
      });

      setUnreadCount(prev => prev + 1);
      fetchUnreadCount();

      toast.info(newNotification.title || "Bạn có thông báo mới", {
        onClick: () => {
          if (!newNotification.read) handleMarkAsRead(newNotification.id);
        },
      });
    }

    if (data.type === "UNREAD_COUNT") {
      setUnreadCount(data.payload || 0);
    }
  };

  useWebSocket(getWebSocketUrl(), handleWebSocketMessage);

  useEffect(() => {
    if (!isAdmin()) {
      fetchNotifications();
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (dropdownOpen && !isAdmin()) fetchNotifications();
  }, [dropdownOpen, user]);

  if (isAdmin()) return null;

  // --- Dropdown Content ---
  const notificationContent = (
    <div style={{ width: 450, maxHeight: 500, display: "flex", flexDirection: "column", backgroundColor: "white" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
        <Space>
          {unreadCount > 0 && <Button type="link" size="small" onClick={handleMarkAllAsRead}>Đánh dấu tất cả đã đọc</Button>}
          <Button type="link" size="small" onClick={handleHideReadNotifications}>Xóa thông báo đã đọc</Button>
        </Space>
      </div>
      <div style={{ overflowY: "auto", flex: 1, maxHeight: 400 }}>
        <List
          dataSource={notifications}
          loading={loading}
          locale={{ emptyText: "Không có thông báo" }}
          renderItem={item => {
            if (!item) return null;
            const createdAt = item.createdAt || item.created_at;
            const isRead = !!item.read;
            const itemId = item.id;
            return (
              <List.Item
                key={itemId}
                style={{
                  padding: 16,
                  cursor: "pointer",
                  backgroundColor: !isRead ? "#f0f9ff" : "white",
                  borderBottom: "1px solid #f5f5f5"
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown from closing
                  handleViewDetail(item);
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = !isRead ? "#e6f7ff" : "#fafafa"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = !isRead ? "#f0f9ff" : "white"; }}
              >
                <List.Item.Meta
                  title={<Text strong={!isRead} style={{ whiteSpace: "normal" }}>{item.title || ""}</Text>}
                  description={
                    <div>
                      <Text type="secondary" style={{ whiteSpace: "pre-wrap", display: "block" }}>{item.message || ""}</Text>
                      {createdAt && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(createdAt).format("HH:mm:ss DD/MM/YYYY")}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        open={dropdownOpen}
        onOpenChange={(open) => {
          // Don't close dropdown if modal is open
          if (!open && detailVisible) {
            return; // Keep dropdown open
          }
          setDropdownOpen(open);
        }}
        dropdownRender={() => notificationContent}
        placement="bottomRight"
        trigger={["click"]}
        getPopupContainer={trigger => trigger.parentElement || document.body}
      >
        <div style={{ cursor: "pointer", marginRight: 16 }}>
          <Badge count={unreadCount} size="small">
            <BellOutlined style={{ fontSize: 24, color: "#666" }} />
          </Badge>
        </div>
      </Dropdown>

      <Modal
        open={detailVisible}
        title={selectedNotification?.title || "Thông báo"}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedNotification(null);
        }}
        maskClosable={true}
        destroyOnClose={true}
        getContainer={false}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedNotification ? (
          <div>
            <p style={{ whiteSpace: "pre-line", fontSize: "16px", lineHeight: "1.6" }}>
              {selectedNotification.message}
            </p>
            {selectedNotification.createdAt && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {dayjs(selectedNotification.createdAt).format("HH:mm:ss DD/MM/YYYY")}
                </Text>
              </div>
            )}
          </div>
        ) : (
          <p>Không có thông tin</p>
        )}
      </Modal>
    </>
  );
}
