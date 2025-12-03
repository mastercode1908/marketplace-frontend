// Quản lý trạng thái user + token.
// src/store/slices/userSlice.js

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import authApi from "../../api/identity/authApi";

// export const login = createAsyncThunk("user/login", async (credentials) => {
//     const res = await authApi.login(credentials);
//     localStorage.setItem("accessToken", res.accessToken);
//     return res.user;
// });

// export const loadUser = createAsyncThunk("user/loadUser", async () => {
//     const res = await authApi.getProfile();
//     return res;
// });

// const userSlice = createSlice({
//     name: "user",
//     initialState: { user: null, loading: false },
//     reducers: {
//         logout: (state) => {
//             state.user = null;
//             localStorage.removeItem("accessToken");
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(login.fulfilled, (state, action) => {
//                 state.user = action.payload;
//             })
//             .addCase(loadUser.fulfilled, (state, action) => {
//                 state.user = action.payload;
//             });
//     },
// });

// export const { logout } = userSlice.actions;
// export default userSlice.reducer;
