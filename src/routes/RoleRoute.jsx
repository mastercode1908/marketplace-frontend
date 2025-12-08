import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

/**
 * Component bảo vệ route theo role
 * @param {string|string[]} allowedRoles - Các role được phép truy cập (Whitelist)
 * @param {string|string[]} deniedRoles - Các role bị chặn truy cập (Blacklist)
 */
import NotFoundPage from "../pages/NotFoundPage";

/**
 * Component bảo vệ route theo role
 * @param {string|string[]} allowedRoles - Các role được phép truy cập (Whitelist)
 * @param {string|string[]} deniedRoles - Các role bị chặn truy cập (Blacklist)
 */
const RoleRoute = ({ allowedRoles, deniedRoles }) => {
  const { user, loading } = useAuth();

  // Roles that should be hidden from unauthorized users (show 404 instead of 403/Login)
  const HIDDEN_ROLES = ['ADMIN', 'SYSTEMADMIN', 'CONTENTADMIN', 'SELLER'];

  const isHiddenRoute = () => {
    if (!allowedRoles) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.some(role => HIDDEN_ROLES.includes(role.toUpperCase()));
  };

  if (loading) {
    return null;
  }

  // Nếu chưa đăng nhập
  if (!user) {
    // Nếu có yêu cầu role cụ thể (whitelist)
    if (allowedRoles) {
      // Nếu là route ẩn (admin/seller) -> Show 404 để giấu đường dẫn
      if (isHiddenRoute()) {
        return <NotFoundPage />;
      }
      // Route thường -> Redirect login
      return <Navigate to="/login" replace />;
    }

    // Nếu chỉ có blacklist (deniedRoles) hoặc không có cả 2 -> cho phép guest
    return <Outlet />;
  }

  // Normalize role: CONTENT_ADMIN -> CONTENTADMIN, SYSTEM_ADMIN -> SYSTEMADMIN
  const rawRole = (user.user?.role || user.role)?.toUpperCase();
  const userRole = rawRole?.replace(/_/g, '');
  let hasAccess = true;

  // Redirect map - redirect về dashboard của từng role
  const redirectMap = {
    SYSTEMADMIN: '/admin/dashboard',
    ADMIN: '/admin/dashboard',
    CONTENTADMIN: '/content-admin/dashboard',
    SELLER: '/seller/dashboard',
    BUYER: '/home'
  };

  // Logic 1: Check Blacklist (deniedRoles)
  if (deniedRoles) {
    const denied = Array.isArray(deniedRoles) ? deniedRoles : [deniedRoles];
    if (denied.some(role => role.toUpperCase() === userRole)) {
      hasAccess = false;
    }
  }

  // Logic 2: Check Whitelist (allowedRoles) - Chỉ check nếu chưa bị chặn bởi blacklist
  if (hasAccess && allowedRoles) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.some(role => role.toUpperCase() === userRole)) {
      hasAccess = false;
    }
  }

  if (!hasAccess) {
    // Nếu là route ẩn (admin/seller routes) -> Show 404 để giấu đường dẫn
    if (isHiddenRoute()) {
      return <NotFoundPage />;
    }

    toast.error("Bạn không có quyền truy cập trang này");

    // Redirect về dashboard của role tương ứng
    const redirectTo = redirectMap[userRole] || '/home';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
