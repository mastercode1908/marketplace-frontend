// Sử dụng Zustand hoặc Redux Toolkit.
// quản lý state toàn app.

// Ví dụ Zustand:
// import { create } from "zustand";

// export const useAppStore = create((set) => ({
//     theme: "light",
//     toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
// }));

// src/store/index.js

// import { configureStore } from "@reduxjs/toolkit";
// import userReducer from "./slices/userSlice";
// import cartReducer from "./slices/cartSlice";
// import uiReducer from "./slices/uiSlice";

// const configstore = configureStore({
//     reducer: {
//         user: userReducer,
//         cart: cartReducer,
//         ui: uiReducer,
//     },
// });
// export default configstore;