import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

// Component cung cấp AuthContext cho toàn app
// destructuring
// export const AuthProvider = ({ children }) => {
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Khi app load hoặc có sự thay đổi trong localStorage, cập nhật state user
    useEffect(() => {
        const loadUser = () => {
            const saved = localStorage.getItem("user");
            if (saved) {
                try {
                    setUser(JSON.parse(saved));
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                    localStorage.removeItem("user");
                }
            }
        };

        loadUser();
        setLoading(false);

        // Lắng nghe sự kiện storage để cập nhật realtime (ví dụ khi update profile)
        const handleStorageChange = () => {
            loadUser();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Nếu có dữ liệu, setUser(saved) để khởi tạo state user.
    // Như vậy, khi người dùng refresh trang, trạng thái login vẫn được giữ.

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
