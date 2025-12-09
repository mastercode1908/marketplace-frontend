import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Chặn route nếu chưa đăng nhập
const PrivateRoute = () => {
    const { user, loading } = useAuth();
    
    // Đợi AuthProvider load user từ localStorage trước khi kiểm tra
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                Đang tải...
            </div>
        );
    }
    
    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

