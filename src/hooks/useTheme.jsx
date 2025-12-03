import { useEffect } from "react";
import { useAppStore } from "../store";

// Hook xử lý dark/light mode (sau này dùng với Tailwind dễ lắm)
export const useTheme = () => {
    const { theme, toggleTheme } = useAppStore();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    return { theme, toggleTheme };
};
