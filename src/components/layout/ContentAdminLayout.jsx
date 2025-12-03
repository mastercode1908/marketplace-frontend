import { useState, useEffect } from "react";
import { Layout, Drawer } from "antd";
import { Outlet } from "react-router-dom";
import ContentAdminSidebar from "./ContentAdminSidebar";
import ContentAdminHeader from "./ContentAdminHeader";

const { Content } = Layout;

export default function ContentAdminLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                background: "#f5f7fa",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {!isMobile && <ContentAdminSidebar />}

                <Drawer
                    title="Menu"
                    placement="left"
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    width={280}
                    bodyStyle={{ padding: 0 }}
                >
                    <ContentAdminSidebar />
                </Drawer>

                <Layout
                    style={{
                        background: "#f5f7fa",
                        marginLeft: !isMobile ? "250px" : "0",
                        transition: "margin-left 0.2s",
                    }}
                >
                    <ContentAdminHeader />
                    <Content
                        style={{
                            margin: "24px",
                            padding: "24px",
                            background: "white",
                            borderRadius: "8px",
                            minHeight: "calc(100vh - 48px - 89px)", // Adjust height for header
                            overflowY: "auto",
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </div>
        </div>
    );
}
