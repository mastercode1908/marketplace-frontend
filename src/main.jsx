import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import router from "./routes/routes";
import "./styles/index.css";
import "./styles/responsive.css";
import { Provider } from "react-redux";
import "antd/dist/reset.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </AuthProvider>
  </React.StrictMode>
);


// Thiết lập môi trường: Router, Redux, Zustand, Context, ThemeProvider,…
// Khi xong, bạn đã có:

// .env quản lý config
// axiosInstance cho API call
// Router v6 chuẩn module
// Style (Tailwind + Ant Design theme)
// Context quản lý user login
// Helpers & constants dùng chung