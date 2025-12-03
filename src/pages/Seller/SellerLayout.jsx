import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import SellerHeader from "../../components/layout/SellerHeader";
import SellerSidebar from "../../components/layout/SellerSidebar";
import HomeFooter from "../../components/layout/HomeFooter";
import "../../styles/SellerLayout.css";

const { Content } = Layout;

export default function SellerLayout() {
  return (
    <div className="seller-layout">
      <SellerHeader />
      <Layout style={{ minHeight: "calc(100vh - 70px)", background: "#F5F5FA" }}>
        <SellerSidebar />
        <Layout style={{ background: "#F5F5FA" }}>
          <Content
            style={{
              margin: "24px",
              padding: "24px",
              background: "white",
              borderRadius: "8px",
              minHeight: "calc(100vh - 70px)",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}


