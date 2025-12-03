import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
    CheckCircleOutlined,
    FlagOutlined,
    PictureOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import "../../styles/SellerLayout.css";

const { Sider } = Layout;

export default function ContentAdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: "/content-admin/dashboard",
            icon: <CheckCircleOutlined />,
            label: "Duyệt Sản Phẩm",
        },
        {
            key: "/content-admin/reports",
            icon: <FlagOutlined />,
            label: "Quản lý báo cáo",
        },
        {
            key: "/content-admin/banners",
            icon: <PictureOutlined />,
            label: "Quản Lý Banner",
        },
        {
            key: "/user/chat",
            icon: <MessageOutlined />,
            label: "Tin nhắn",
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
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
                    Content Admin
                </p>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
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
