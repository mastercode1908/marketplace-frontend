import axiosInstance from "../axiosInstance";

const sellerApi = {
  // Products
  getProducts: async () => {
    // GET /api/product/me (Lấy sản phẩm của seller hiện tại)
    const res = await axiosInstance.get("/product/me");
    // Backend trả về ApiResponse { success: true, data: [...] }
    const data = res.data.data || res.data.result || res.data;
    return Array.isArray(data) ? data : [];
  },

  getProductById: async (productId) => {
    const res = await axiosInstance.get(`/buyer/product/${productId}`);
    return res.data;
  },

  createProduct: async (data) => {
    // POST /api/products
    // Request: { name, description, category_id, price, stock_quantity, image_url }
    // Response: { Message, product: { product_id, name, product_status, is_primary } }
    const res = await axiosInstance.post("/products", data);
    return res.data;
  },

  updateProduct: async (productId, data) => {
    // PUT /api/products/{id}
    // Request: { name, description, category_id, price, stock_quantity, image_url }
    // Response: { Message, product: { product_id, name, product_status, is_primary } }
    const res = await axiosInstance.put(`/products/${productId}`, data);
    return res.data;
  },

  deleteProduct: async (productId) => {
    // DELETE /api/products/{id}
    await axiosInstance.delete(`/products/${productId}`);
  },

  // Orders (Buyers Management)
  getSellerOrders: async () => {
    const res = await axiosInstance.get("/orders/seller");
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await axiosInstance.get(`/orders/${orderId}`);
    return res.data;
  },

  syncOrderStatus: async (orderId) => {
    const res = await axiosInstance.post(`/orders/${orderId}/sync-ghn`);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    // TODO: Cần endpoint GET /api/categories khi backend có
    const res = await axiosInstance.get("/categories");
    return res.data;
  },

  // Vouchers/Promotions (Seller có thể xem và sử dụng)
  getVouchers: async () => {
    // TODO: Cần endpoint GET /api/seller/vouchers khi backend có
    const res = await axiosInstance.get("/seller/vouchers");
    return res.data;
  },

  // Statistics/Dashboard
  getDashboardStats: async () => {
    // TODO: Cần endpoint GET /api/seller/dashboard/stats khi backend có
    // Tạm thời tính toán từ orders và products
    const [orders, products] = await Promise.all([
      sellerApi.getSellerOrders().catch(() => []),
      sellerApi.getProducts().catch(() => []),
    ]);

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount || 0));
    }, 0);

    const totalOrders = orders.length;
    const totalProducts = products.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      pendingOrders,
    };
  },
};

export default sellerApi;

