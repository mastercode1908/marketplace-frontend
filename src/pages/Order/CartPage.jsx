import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartApi } from "../../api/commerce/CartApi";
import {
  Button,
  Card,
  Empty,
  Spin,
  InputNumber,
  Popconfirm,
  Checkbox,
} from "antd";
import { toast } from "react-hot-toast";
import {
  ShoppingCartOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";

/**
 * Trang giỏ hàng - Redesigned với checkbox selection
 */
const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  // Tự động chọn tất cả items khi load cart
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      const allItemIds = new Set(cart.items.map((item) => item.itemId));
      setSelectedItems(allItemIds);
    }
  }, [cart]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await CartApi.getCart();
      setCart(res.data);
    } catch (error) {
      toast.error("Không thể tải giỏ hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked && cart && cart.items) {
      const allItemIds = new Set(cart.items.map((item) => item.itemId));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const res = await CartApi.updateQuantity(itemId, newQuantity);
      setCart(res.data);
      toast.success("Cập nhật số lượng thành công");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật số lượng";
      toast.error(errorMessage);
      loadCart();
    }
  };

  const handleIncreaseQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    if (item.stockQuantity && newQuantity > item.stockQuantity) {
      toast.error(
        `Số lượng tối đa là ${item.stockQuantity}. Không thể tăng thêm.`
      );
      return;
    }
    handleUpdateQuantity(item.itemId, newQuantity);
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      toast.error("Số lượng tối thiểu là 1");
      return;
    }
    handleUpdateQuantity(item.itemId, item.quantity - 1);
  };

  const handleQuantityChange = (item, value) => {
    if (!value || value < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }
    if (item.stockQuantity && value > item.stockQuantity) {
      toast.error(
        `Số lượng tối đa là ${item.stockQuantity}. Không thể tăng thêm.`
      );
      return;
    }
    handleUpdateQuantity(item.itemId, value);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await CartApi.deleteItem(itemId);
      setCart(res.data);
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    try {
      await CartApi.clearCart();
      setCart(null);
      setSelectedItems(new Set());
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error("Không thể xóa giỏ hàng");
      console.error(error);
    }
  };

  // Tính toán tổng tiền cho các items đã chọn
  const calculateSelectedTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items
      .filter((item) => selectedItems.has(item.itemId))
      .reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const selectedTotal = calculateSelectedTotal();
  const allSelected =
    cart && cart.items && cart.items.length > 0
      ? cart.items.every((item) => selectedItems.has(item.itemId))
      : false;
  const someSelected =
    cart && cart.items && cart.items.length > 0
      ? cart.items.some((item) => selectedItems.has(item.itemId))
      : false;

  /**
   * Xử lý thanh toán - chỉ với items đã chọn
   */
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const selectedCartItems = cart.items.filter((item) =>
      selectedItems.has(item.itemId)
    );

    // Kiểm tra số lượng tồn kho có đủ không
    const insufficientStockItems = selectedCartItems.filter((item) => {
      const availableStock =
        item.stockQuantity != null ? item.stockQuantity : 0;
      return availableStock < item.quantity;
    });

    if (insufficientStockItems.length > 0) {
      const itemNames = insufficientStockItems
        .map(
          (item) =>
            `${item.productName} (còn ${item.stockQuantity || 0}, yêu cầu ${item.quantity
            })`
        )
        .join(", ");
      toast.error(
        `Số lượng sản phẩm trong kho không đủ: ${itemNames}. Vui lòng cập nhật số lượng hoặc xóa sản phẩm khỏi giỏ hàng.`
      );
      return;
    }

    // Kiểm tra tổng tiền có vượt quá 50 triệu VND không (bao gồm phí vận chuyển)
    const MAX_ORDER_AMOUNT = 50000000; // 50 triệu VND
    const SHIPPING_FEE = 30000; // Phí vận chuyển cố định
    const maxAmountBeforeShipping = MAX_ORDER_AMOUNT - SHIPPING_FEE; // 49,970,000 VND

    if (selectedTotal > maxAmountBeforeShipping) {
      const finalAmount = selectedTotal + SHIPPING_FEE;
      toast.error(
        `Tổng đơn hàng (${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(finalAmount)}) vượt quá giới hạn ${new Intl.NumberFormat(
          "vi-VN",
          {
            style: "currency",
            currency: "VND",
          }
        ).format(
          MAX_ORDER_AMOUNT
        )}. Vui lòng giảm số lượng sản phẩm hoặc xóa bớt sản phẩm khỏi giỏ hàng.`
      );
      return;
    }

    // Lưu selected items vào localStorage để checkout page có thể sử dụng
    localStorage.setItem(
      "selectedCartItems",
      JSON.stringify(selectedCartItems.map((item) => item.itemId))
    );

    navigate("/checkout", {
      state: { selectedItems: selectedCartItems },
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
        <HomeHeader />
        <div className="flex justify-center items-center" style={{ minHeight: "60vh" }}>
          <Spin size="large" />
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
        <HomeHeader />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: "1200px" }}>
          <Empty
            description="Giỏ hàng trống"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/home")}
              style={{ backgroundColor: "#008ECC", borderColor: "#008ECC" }}
            >
              Mua sắm ngay
            </Button>
          </Empty>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
      <HomeHeader />
      <div
        className="container mx-auto px-4 py-8"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center mb-6"
          style={{ background: "white", padding: "20px", borderRadius: "12px" }}
        >
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "#333", margin: 0 }}
          >
            <ShoppingCartOutlined style={{ color: "#008ECC" }} /> Giỏ hàng của
            tôi
          </h1>
          {cart && cart.items.length > 0 && (
            <Popconfirm
              title="Xóa tất cả sản phẩm?"
              description="Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?"
              onConfirm={handleClearCart}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Xóa tất cả
              </Button>
            </Popconfirm>
          )}
        </div>

        {/* Main Content - Compact Window Style */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* Select All */}
          <div
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: "1px solid #EDEDED" }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              <span style={{ fontWeight: 600, fontSize: "16px" }}>
                Chọn tất cả ({selectedItems.size}/{cart.items.length})
              </span>
            </Checkbox>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-6">
            {cart.items.map((item) => (
              <div
                key={item.itemId}
                style={{
                  border: "1px solid #EDEDED",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#008ECC";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,142,204,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#EDEDED";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={selectedItems.has(item.itemId)}
                  onChange={() => handleSelectItem(item.itemId)}
                />

                {/* Product Image */}
                <img
                  src={item.productImage || "/placeholder.png"}
                  alt={item.productName}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                {/* Product Info */}
                <div className="flex-1">
                  <h3
                    className="font-semibold text-lg mb-1"
                    style={{ color: "#333", margin: 0 }}
                  >
                    {item.productName}
                  </h3>
                  <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                    Shop: {item.sellerName}
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "#008ECC", margin: "8px 0 0 0" }}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.unitPrice)}
                  </p>
                  {item.stockQuantity !== null &&
                    item.stockQuantity !== undefined && (
                      <p
                        style={{
                          color: "#999",
                          fontSize: "12px",
                          margin: "4px 0 0 0",
                        }}
                      >
                        Tồn kho: {item.stockQuantity}
                      </p>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      icon={<MinusOutlined />}
                      onClick={() => handleDecreaseQuantity(item)}
                      disabled={item.quantity <= 1}
                      style={{ minWidth: "32px" }}
                    />
                    <InputNumber
                      min={1}
                      max={item.stockQuantity || undefined}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(item, value)}
                      controls={false}
                      style={{ width: 70, textAlign: "center" }}
                    />
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleIncreaseQuantity(item)}
                      disabled={
                        item.stockQuantity !== null &&
                        item.stockQuantity !== undefined &&
                        item.quantity >= item.stockQuantity
                      }
                      style={{ minWidth: "32px" }}
                    />
                  </div>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "#FF4D4F", margin: 0 }}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.subtotal)}
                  </p>
                </div>

                {/* Delete Button */}
                <Popconfirm
                  title="Xóa sản phẩm?"
                  description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
                  onConfirm={() => handleDeleteItem(item.itemId)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    type="text"
                    style={{ color: "#FF4D4F", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </div>
            ))}
          </div>

          {/* Summary & Checkout */}
          <div
            style={{
              borderTop: "2px solid #EDEDED",
              paddingTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                Đã chọn: <strong>{selectedItems.size}</strong> sản phẩm
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "#FF4D4F", margin: "8px 0 0 0" }}
              >
                Tổng thanh toán:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedTotal)}
              </p>
              {selectedTotal > 49900000 && (
                <p
                  style={{
                    color: "#FF9800",
                    fontSize: "12px",
                    margin: "4px 0 0 0",
                  }}
                >
                  Tổng đơn hàng gần đạt giới hạn 50 triệu VND
                </p>
              )}
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleCheckout}
              disabled={selectedItems.size === 0 || selectedTotal > 49970000}
              style={{
                backgroundColor: "#008ECC",
                borderColor: "#008ECC",
                height: "48px",
                padding: "0 32px",
                fontSize: "16px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckOutlined /> Thanh toán ({selectedItems.size})
            </Button>
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
};

export default CartPage;
