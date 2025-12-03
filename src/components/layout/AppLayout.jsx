// src/layouts/AppLayout.jsx
// AppLayout.jsx thường dùng để:
// Chứa header, sidebar, footer, và khu vực main content.
// Dùng để bọc (wrap) các page con lại thông qua <Outlet /> (nếu bạn xài react-router-dom).

import { Toaster } from "react-hot-toast";
import { Outlet, useLocation } from "react-router-dom";
import ChatbotWidget from "../common/ChatbotWidget";
// import Header from "./Header";
// import Sidebar from "./Sidebar";

export default function AppLayout() {
    const location = useLocation();

    // Whitelist: Only show chatbot on these specific public paths
    const allowedRoutes = [
        '/home',
        '/product',
        '/category',
        '/search',
        '/shop',
        '/promotion-detail'
    ];

    // Check if current path starts with any allowed route, or is exactly root '/'
    const showChatbot = location.pathname === '/' || allowedRoutes.some(route => location.pathname.startsWith(route));

    return (
        <div className="app-layout">
            {/* <Header /> */}
            <div className="content-wrapper">
                {/* <Sidebar /> */}
                <Toaster position="top-center" />
                <main className="main-content">
                    <Outlet /> {/* Nơi render các page con */}
                </main>
            </div>
            {showChatbot && <ChatbotWidget />}
        </div>
    );
}
