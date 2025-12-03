import axiosInstance from "../axiosInstance";

export const sellerProfileApi = {
  getProfile: async () => {
    const res = await axiosInstance.get("/seller/profile");
    return res.data; // res.data is SellerResponse { user, seller }
  },
  updateProfile: async (data) => {
    const res = await axiosInstance.put("/seller/profile", data);
    return res.data; // res.data is SellerResponse { user, seller }
  },
};

export default sellerProfileApi;
