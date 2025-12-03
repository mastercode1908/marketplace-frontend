import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Custom hook để truy cập context nhanh
export const useAuth = () => useContext(AuthContext);
