import axiosInstance from "../axiosInstance";

const wishlistApi = {
  getAll: async (page = 0, pageSize = 10) => {
    const res = await axiosInstance.get("/users/wishlist", {
      params: { page, pageSize },
    });
    return res.data || {};
  },

  addProduct: async (productId) => {
    if (!productId) throw new Error("product_id is required");
    const res = await axiosInstance.post(`/users/wishlist/product/${productId}`, {
      product_id: productId,
    });
    return res.data;
  },

  removeProduct: async (productId) => {
    if (!productId) throw new Error("product_id is required");
    const res = await axiosInstance.delete(`/users/wishlist/${productId}/delete`);
    return res.data;
  },

  search: async (text) => {
    if (!text) return [];
    const res = await axiosInstance.post("/users/wishlist/search", { text });
    return res.data || [];
  },
};

export default wishlistApi;

