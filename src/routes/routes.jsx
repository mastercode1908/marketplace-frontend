import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RoleRoute from "./RoleRoute";
import PrivateRoute from "./PrivateRoute";

// Pages Imports
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordRequestPage from "../pages/auth/ForgotPasswordRequestPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import GoogleCallbackPage from "../pages/auth/GoogleCallbackPage";
import ProductTestPage from "../api/catalog/ProductTestPage";
import SellerInfoPage from "../pages/auth/SellerInfoPage";
import SellerProductForm from "../pages/Seller/ProductPage";

// Info Pages
import AboutPage from "../pages/info/AboutPage";
import PrivacyPolicyPage from "../pages/info/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/info/TermsOfServicePage";
import ContactPage from "../pages/info/ContactPage";
import FAQPage from "../pages/info/FAQPage";

import HomePage from "../pages/Catalog/HomePage";
import ProductDetailPage from "../pages/Catalog/ProductDetailPage";
import ShopDetailPage from "../pages/Catalog/ShopDetailPage";
import CategoryDetailPage from "../pages/Catalog/CategoryDetailPage";
import SearchResultPage from "../pages/Catalog/SearchResultPage";
import PromotionDetailPage from "../pages/Catalog/PromotionDetailPage";
import UserProfilePage from "@/pages/User/UserProfilePage";
import UserLayout from "@/pages/User/UserLayout";
import ManageProductSellerPage from "@/pages/Seller/ManageProductPage";

// Admin Pages
import AdminPage from "../pages/Admin/AdminPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import NotificationsPage from "../pages/Admin/NotificationsPage";
import ServicePackagesPage from "../pages/Admin/ServicePackagesPage";
import CategoriesPage from "../pages/Admin/CategoriesPage";
import DiscountCodesPage from "../pages/Promotion/DiscountCodesPage";
import FlashSalePage from "../pages/Promotion/FlashSalePage";
import UsersPage from "../pages/Admin/UsersPage";
import SellerReviewPage from "../pages/Admin/SellerReviewPage";

// Content Admin Pages
import ContentAdminLayout from "../components/layout/ContentAdminLayout";
import ContentAdminDashboardPage from "../pages/Admin/ContentAdminDashboardPage";
import ReportManagementPage from "../pages/Admin/ReportManagementPage";
import ContentAdminBannerPage from "../pages/Admin/ContentAdminBannerPage";

// Seller Pages
import SellerLayout from "../pages/Seller/SellerLayout";
import SellerDashboardPage from "../pages/Seller/SellerDashboardPage";
import SellerBuyersPage from "../pages/Seller/SellerBuyersPage";
import SellerVouchersPage from "../pages/Seller/SellerVouchersPage";
import SellerProfilePage from "../pages/Seller/SellerProfilePage";
import GHNShopInfoPage from "../pages/Seller/GHNShopInfoPage";
import SellerServicePackagesPage from "../pages/Seller/ServicePackagesPage";
import SellerPromotionPage from "../pages/Seller/SellerPromotionPage";
import SellerBannerManagementPage from "../pages/Seller/SellerBannerManagementPage";
import CreateBannerPage from "../pages/Seller/CreateBannerPage";

// Buyer Pages
import CartPage from "../pages/Order/CartPage";
import CheckoutPage from "../pages/Order/CheckoutPage";
import OrderHistoryPage from "../pages/Order/OrderHistoryPage";
import VNPayPaymentReturn from "@/pages/Order/PaymentReturn";
import ChatUI from "@/pages/User/chat-app";
// import UserProfilePage from "../pages/user/UserProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // 1. Public Routes - Chỉ dành cho BUYER và guest (chặn SYSTEMADMIN, CONTENTADMIN, SELLER)
      { path: "", element: <Navigate to="/home" replace /> },
      {
        element: <RoleRoute deniedRoles={["SYSTEMADMIN", "ADMIN", "CONTENTADMIN", "SELLER"]} />,
        children: [
          { path: "home", element: <HomePage /> },
        ],
      },

      // Info Pages - Public access for all users including guests
      { path: "about", element: <AboutPage /> },
      { path: "privacy", element: <PrivacyPolicyPage /> },
      { path: "terms", element: <TermsOfServicePage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "faq", element: <FAQPage /> },

      // 2. Auth Routes
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify", element: <VerifyEmailPage /> },
      { path: "forgot", element: <ForgotPasswordRequestPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "google-callback", element: <GoogleCallbackPage /> },

      // Shared Routes (Accessible by all)
      { path: "payment/return", element: <VNPayPaymentReturn /> },
      { path: "shop-information", element: <SellerInfoPage /> },
      
      // 3. Buyer Routes - Chỉ dành cho BUYER (chặn SYSTEMADMIN, CONTENTADMIN, SELLER)
      {
        element: <RoleRoute deniedRoles={["SYSTEMADMIN", "ADMIN", "CONTENTADMIN", "SELLER"]} />,
        children: [
          { path: "product/:productId", element: <ProductDetailPage /> },
          { path: "category/:categoryId", element: <CategoryDetailPage /> },
          { path: "search", element: <SearchResultPage /> },
          { path: "promotion-detail", element: <PromotionDetailPage /> },
          { path: "product-test", element: <ProductTestPage /> },
          { path: "shop/:shopId", element: <ShopDetailPage /> },
        ],
      },

      // 3.5. Chat Route - Accessible to all authenticated users (including SELLER)
      {
        element: <PrivateRoute />,
        children: [{ path: "user/chat", element: <ChatUI /> }],
      },

      // 4. Content Admin Routes
      {
        path: "content-admin",
        element: <RoleRoute allowedRoles={["CONTENTADMIN", "ADMIN"]} />,
        children: [
          {
            element: <ContentAdminLayout />,
            children: [
              { path: "content_admin", element: <ContentAdminDashboardPage /> },
              { path: "dashboard", element: <ContentAdminDashboardPage /> },
              { path: "reports", element: <ReportManagementPage /> },
              { path: "banners", element: <ContentAdminBannerPage /> },
            ],
          },
        ],
      },

      // 5. System Admin Routes
      {
        path: "admin",
        element: <RoleRoute allowedRoles={["SYSTEMADMIN", "ADMIN"]} />,
        children: [
          {
            element: <AdminPage />,
            children: [
              { path: "", element: <AdminDashboardPage /> },
              { path: "dashboard", element: <AdminDashboardPage /> },
              { path: "notification", element: <NotificationsPage /> },
              { path: "servicepackage", element: <ServicePackagesPage /> },
              { path: "categories", element: <CategoriesPage /> },
              { path: "discount", element: <DiscountCodesPage /> },
              { path: "flash_sale", element: <FlashSalePage /> },
              { path: "user_manage", element: <UsersPage /> },
              { path: "seller_review", element: <SellerReviewPage /> },
            ],
          },
        ],
      },

      // 6. Seller Routes
      {
        path: "seller",
        element: <RoleRoute allowedRoles="SELLER" />,
        children: [
          {
            element: <SellerLayout />,
            children: [
              { path: "dashboard", element: <SellerDashboardPage /> },
              { path: "buyers", element: <SellerBuyersPage /> },
              { path: "products", element: <ManageProductSellerPage /> },
              { path: "vouchers", element: <SellerVouchersPage /> },
              { path: "promotions", element: <SellerPromotionPage /> },
              { path: "banners", element: <SellerBannerManagementPage /> },
              { path: "banners/create", element: <CreateBannerPage /> },
              { path: "banners/:id/edit", element: <CreateBannerPage /> },
              { path: "profile", element: <SellerProfilePage /> },
              { path: "orders", element: <OrderHistoryPage /> },
              { path: "orders/:orderId", element: <OrderHistoryPage /> },
              { path: "ghn-shop-info", element: <GHNShopInfoPage /> },
              {
                path: "service-packages",
                element: <SellerServicePackagesPage />,
              },
              { path: "product-seller", element: <SellerProductForm /> },
              {
                path: "product-seller/:productId",
                element: <SellerProductForm />,
              },
            ],
          },
        ],
      },

      // 7. Buyer/User Routes
      {
        element: <RoleRoute allowedRoles="BUYER" />,
        children: [
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          {
            path: "user",
            element: <UserLayout />,
            children: [
              { path: "profile", element: <UserProfilePage /> },
              { path: "orders", element: <OrderHistoryPage /> },
              { path: "orders/:orderId", element: <OrderHistoryPage /> },
            ],
          },
        ],
      },

      // Shared/Misc Routes
      // { path: "user_profile", element: <UserProfilePage /> }, // Moved to /user/profile

      // Fallback
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;

// Layout chính – AppLayout
// AppLayout là component chung cho tất cả route con, ví dụ chứa:
// Header, Navbar, Sidebar, Footer
// <Outlet /> để render các route con

// children là nested routes:
// path: "" → default route khi vào /.
// path: "login" → route /login.
// path: "*" → route “catch-all” khi không tìm thấy đường dẫn, hiển thị 404 page.
// Lưu ý:
// Các route con sẽ được render bên trong <Outlet /> của AppLayout.

// 🔹 Tổng kết
// Đây là cấu trúc SPA chuẩn với React Router v6+:
// Có layout chung (AppLayout)
// Có các route con
// Có route fallback 404 (*)

// Lợi ích:
// Dễ quản lý route lớn
// Layout dùng chung cho nhiều trang
// Cấu trúc nested route rõ ràng
