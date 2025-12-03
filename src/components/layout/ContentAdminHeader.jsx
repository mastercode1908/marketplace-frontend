import { useNavigate, Link } from "react-router-dom";
import { Layout, Avatar, Dropdown, Space, Modal } from "antd";
import { UserOutlined, LogoutOutlined, MessageOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";

const { Header } = Layout;

export default function ContentAdminHeader() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const displayName = user?.fullName || user?.user?.fullName || "Content Admin";
    const avatarUrl = user?.avatar || user?.avatarUrl || user?.user?.avatarUrl;

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (logout) logout();
        navigate("/login");
    };

    const menuItems = [
        {
            key: "logout",
            label: (
                <span style={{
                    fontSize: "14px",
                    padding: "4px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: "8px"
                }}>
                    <LogoutOutlined style={{ fontSize: "16px" }} /> Đăng xuất
                </span>
            ),
            onClick: handleLogout,
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
        <Header
            style={{
                background: "white",
                padding: "0 24px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                height: "89px",
            }}
        >
            <Space size="middle" style={{ display: "flex", alignItems: "center" }}>
                <Link
                    to="/user/chat"
                    style={{
                        position: "relative",
                        cursor: "pointer",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    <MessageOutlined
                        style={{ fontSize: "20px", color: "#666666" }}
                    />
                </Link>
                <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                    <Space
                        style={{
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <Avatar size={32} src={avatarUrl} icon={<UserOutlined />} />
                        <span style={{ fontWeight: 500 }}>{displayName}</span>
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
}
