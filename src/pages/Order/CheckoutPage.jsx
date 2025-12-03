/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShippingApi } from "../../api/shipping/ShippingApi";
import { CheckoutApi } from "../../api/commerce/CheckoutApi";
import { CartApi } from "../../api/commerce/CartApi";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Modal,
  Radio,
  Spin,
  Divider,
  Popconfirm,
  message,
  Alert,
  Tag,
} from "antd";
import { toast } from "react-hot-toast";
import {
  EnvironmentOutlined,
  PlusOutlined,
  CheckOutlined,
  DeleteOutlined,
  ShopOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import promotionApi from "@/api/promotion/PromotionApi";

import dayjs from "dayjs";
import { ERROR_MESSAGES_VN } from "@/utils/constants";

const { Option } = Select;
const { TextArea } = Input;

/**
 * Trang thanh toán - Redesigned
 */
const CheckoutPage = () => {
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [filteredCheckoutData, setFilteredCheckoutData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [openPromoModal, setOpenPromoModal] = useState(false);
  const [promotionList, setPromotionList] = useState([]);
  const [currentSellerId, setCurrentSellerId] = useState(null);
  const [manualCode, setManualCode] = useState("");

  // Lấy selected items từ location.state (từ CartPage)
  const selectedItems = location.state?.selectedItems || [];
  const selectedItemIds = new Set(selectedItems.map((item) => item.itemId));

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    loadAddresses();
    loadProvinces();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await ShippingApi.getAddresses();
      setAddresses(res.data);
      if (res.data.length > 0) {
        const defaultAddress = res.data.find((a) => a.isDefault) || res.data[0];
        setSelectedAddressId(defaultAddress.id);
        loadCheckout(defaultAddress.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadProvinces = async () => {
    try {
      const res = await ShippingApi.getProvinces();
      if (res.data && Array.isArray(res.data)) {
        setProvinces(res.data);
      } else {
        setProvinces([]);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
      toast.error(
        "Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau."
      );
      setProvinces([]);
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      const res = await ShippingApi.getDistricts(provinceId);
      if (res.data && Array.isArray(res.data)) {
        setDistricts(res.data);
      } else {
        setDistricts([]);
      }
      setWards([]);
      addressForm.setFieldsValue({
        districtId: null,
        wardCode: null,
      });
    } catch (error) {
      console.error("Error loading districts:", error);
      setDistricts([]);
      setWards([]);
    }
  };

  const loadWards = async (districtId) => {
    try {
      const res = await ShippingApi.getWards(districtId);
      if (res.data && Array.isArray(res.data)) {
        setWards(res.data);
      } else {
        setWards([]);
      }
      addressForm.setFieldsValue({ wardCode: null });
    } catch (error) {
      console.error("Error loading wards:", error);
      setWards([]);
    }
  };

  const loadCheckout = async (addressId) => {
    try {
      setLoading(true);
      const res = await ShippingApi.prepareCheckout(addressId);
      const fullData = res.data;
      setCheckoutData(fullData);

      // Filter chỉ lấy selected items
      if (selectedItemIds.size > 0 && fullData && fullData.sellerOrders) {
        const filteredSellerOrders = fullData.sellerOrders
          .map((sellerOrder) => {
            const filteredItems = sellerOrder.items.filter((item) =>
              selectedItemIds.has(item.itemId)
            );

            if (filteredItems.length === 0) {
              return null;
            }

            const newSubtotal = filteredItems.reduce(
              (sum, item) => sum + (item.subtotal || 0),
              0
            );
            const newTotal = newSubtotal + (sellerOrder.shippingFee || 0);

            return {
              ...sellerOrder,
              items: filteredItems,
              subtotal: newSubtotal,
              total: newTotal,
            };
          })
          .filter(Boolean);

        const newTotalAmount = filteredSellerOrders.reduce(
          (sum, so) => sum + (so.subtotal || 0),
          0
        );
        const newTotalShippingFee = filteredSellerOrders.reduce(
          (sum, so) => sum + (so.shippingFee || 0),
          0
        );
        const newFinalAmount = newTotalAmount + newTotalShippingFee;

        setFilteredCheckoutData({
          ...fullData,
          sellerOrders: filteredSellerOrders,
          totalAmount: newTotalAmount,
          totalShippingFee: newTotalShippingFee,
          finalAmount: newFinalAmount,
        });
      } else {
        setFilteredCheckoutData(fullData);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorCode = error.response?.data?.code;
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin thanh toán";

      if (
        errorCode === 3015 ||
        errorMessage.includes("Quantity exceeds") ||
        errorMessage.includes("quantity") ||
        errorMessage.includes("stock") ||
        errorMessage.includes("số lượng") ||
        errorMessage.includes("kho")
      ) {
        toast.error(
          "Số lượng sản phẩm trong kho không đủ. Vui lòng quay lại giỏ hàng để cập nhật số lượng."
        );
        setTimeout(() => {
          navigate("/cart");
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    loadCheckout(addressId);
  };

  const handleCreateAddress = async (values) => {
    try {
      await ShippingApi.createAddress(values);
      toast.success("Tạo địa chỉ thành công");
      setShowAddressModal(false);
      addressForm.resetFields();
      loadAddresses();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo địa chỉ";
      toast.error(errorMessage);
      console.error("Error creating address:", error);
    }
  };

  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation();

    try {
      await ShippingApi.deleteAddress(addressId);
      toast.success("Đã xóa địa chỉ");

      if (selectedAddressId === addressId) {
        const remainingAddresses = addresses.filter(
          (addr) => addr.id !== addressId
        );
        if (remainingAddresses.length > 0) {
          const newSelectedAddress =
            remainingAddresses.find((addr) => addr.isDefault) ||
            remainingAddresses[0];
          setSelectedAddressId(newSelectedAddress.id);
          loadCheckout(newSelectedAddress.id);
        } else {
          setSelectedAddressId(null);
          setCheckoutData(null);
        }
      }

      loadAddresses();
    } catch (error) {
      toast.error("Không thể xóa địa chỉ");
      console.error(error);
    }
  };

  const handleCheckout = async (values) => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ nhận hàng");
      return;
    }

    if (selectedItemIds.size === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán");
      navigate("/cart");
      return;
    }

    const dataToCheck = filteredCheckoutData || checkoutData;
    if (dataToCheck) {
      const MAX_ORDER_AMOUNT = 50000000;
      if (dataToCheck.finalAmount > MAX_ORDER_AMOUNT) {
        toast.error(
          `Tổng đơn hàng (${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(
            dataToCheck.finalAmount
          )}) vượt quá giới hạn ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(
            MAX_ORDER_AMOUNT
          )}. Vui lòng quay lại giỏ hàng để giảm số lượng sản phẩm.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const unselectedItems = [];
      if (checkoutData && checkoutData.sellerOrders) {
        checkoutData.sellerOrders.forEach((sellerOrder) => {
          sellerOrder.items.forEach((item) => {
            if (!selectedItemIds.has(item.itemId)) {
              unselectedItems.push({
                productId: item.productId,
                quantity: item.quantity,
              });
            }
          });
        });
      }

      const itemsToDelete = [];
      if (checkoutData && checkoutData.sellerOrders) {
        checkoutData.sellerOrders.forEach((sellerOrder) => {
          sellerOrder.items.forEach((item) => {
            if (!selectedItemIds.has(item.itemId)) {
              itemsToDelete.push(item.itemId);
            }
          });
        });
      }

      for (const itemId of itemsToDelete) {
        try {
          await CartApi.deleteItem(itemId);
        } catch (error) {
          console.error(`Error deleting item ${itemId}:`, error);
        }
      }

      const res = await CheckoutApi.checkout({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        note: values.note,
        promotions: (filteredCheckoutData?.sellerOrders || []).map((so) => ({
          sellerId: so.sellerId,
          promotionCode: so.promotionCode || "",
        })),
      });

      if (paymentMethod === "VNPAY") {
        // Nếu là VNPAY, backend trả về URL thanh toán
        const paymentUrl = res.data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl; // Chuyển hướng sang VNPAY
          return; // Không chạy phần khôi phục giỏ hàng, message, navigate
        } else {
          message.error("Không thể lấy URL thanh toán VNPAY");
        }
      } else {
        // Nếu là COD, khôi phục các món không mua
        for (const item of unselectedItems) {
          try {
            await CartApi.addItem({
              productId: item.productId,
              quantity: item.quantity,
            });
          } catch (error) {
            console.error(`Error restoring item ${item.productId}:`, error);
          }
        }

        message.success("Đặt hàng thành công!");
        navigate("/user/orders");
      }

      toast.success("Đặt hàng thành công!");
      navigate("/user/orders");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đặt hàng thất bại";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !checkoutData) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
        <HomeHeader />
        <div
          className="flex justify-center items-center"
          style={{ minHeight: "60vh" }}
        >
          <Spin size="large" />
        </div>
        <HomeFooter />
      </div>
    );
  }

  const openPromotionModal = async (sellerId) => {
    setCurrentSellerId(sellerId);
    setOpenPromoModal(true);

    try {
      const res = await promotionApi.getAll();
      const allVouchers = res.data?.content || [];

      // Get seller name from checkout data
      const sellerOrder = (
        filteredCheckoutData || checkoutData
      )?.sellerOrders?.find((o) => o.sellerId === sellerId);
      const sellerName = sellerOrder?.sellerName || "Shop";

      // Lọc voucher: chỉ lấy admin toàn sàn + voucher của shop hiện tại
      const filteredVouchers = allVouchers
        .filter(
          (v) =>
            ["SYSTEMADMIN", "CONTENTADMIN"].includes(v.ownerType) ||
            (v.ownerType === "SELLER" && v.ownerId === sellerId)
        )
        .map((v) => ({
          ...v,
          // Add seller name for seller promotions
          ownerName:
            v.ownerType === "SELLER"
              ? sellerName
              : ["SYSTEMADMIN", "CONTENTADMIN"].includes(v.ownerType)
              ? "Toàn sàn"
              : v.ownerName || "",
        }));

      // Sort: seller promotions first, then admin promotions
      filteredVouchers.sort((a, b) => {
        if (a.ownerType === "SELLER" && b.ownerType !== "SELLER") return -1;
        if (a.ownerType !== "SELLER" && b.ownerType === "SELLER") return 1;
        return 0;
      });

      setPromotionList(filteredVouchers);
    } catch (error) {
      console.log("Lỗi ", error);
      message.error("Không thể tải mã giảm giá");
    }
  };

  const handleSelectPromotion = async (code, sellerId) => {
    try {
      const sellerOrder = checkoutData.sellerOrders.find(
        (o) => o.sellerId === sellerId
      );

      if (!sellerOrder) return;

      const reqBody = {
        code,
        orderTotal: sellerOrder.subtotal,
        sellerId, // lấy subtotal của seller này
      };

      const res = await promotionApi.preview(reqBody);
      const data = res.data.data; // { code, discountAmount, message }

      // Cập nhật vào đúng sellerOrder
      setFilteredCheckoutData((prev) => {
        const updatedOrders = prev.sellerOrders.map((so) => {
          if (so.sellerId !== sellerId) return so;

          const discount = data.discountAmount;
          const updatedTotal = so.subtotal - discount + so.shippingFee;

          return {
            ...so,
            discountAmount: discount,
            promotionCode: code,
            total: updatedTotal, // dùng cho UI từng seller
          };
        });

        // Tổng tạm tính = tổng tất cả subtotal (không trừ giảm giá)
        const newTotalAmount = updatedOrders.reduce(
          (sum, so) => sum + so.subtotal,
          0
        );

        // Tổng giảm giá = tổng tất cả discountAmount
        const totalDiscount = updatedOrders.reduce(
          (sum, so) => sum + (so.discountAmount || 0),
          0
        );

        const newTotalShippingFee = updatedOrders.reduce(
          (sum, so) => sum + so.shippingFee,
          0
        );

        const newFinalAmount =
          newTotalAmount - totalDiscount + newTotalShippingFee;

        return {
          ...prev,
          sellerOrders: updatedOrders,
          totalAmount: newTotalAmount, // giữ subtotal tổng
          totalDiscount, // thêm tổng giảm giá
          totalShippingFee: newTotalShippingFee,
          finalAmount: newFinalAmount,
        };
      });

      toast.success("Áp dụng mã giảm giá thành công!");
      setOpenPromoModal(false);
    } catch (err) {
      console.error("Promotion error:", err);

      // Lấy code và message từ response
      const code = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || err.message;

      // Mapping sang tiếng Việt nếu có
      const message =
        ERROR_MESSAGES_VN[code] || errorMessage || "Có lỗi xảy ra";

      toast.error(message); // hiện toast error
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
      <HomeHeader />
      <div
        className="container mx-auto px-4 py-8"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/cart")}
            style={{
              border: "none",
              boxShadow: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Quay lại giỏ hàng
          </Button>
          <h1
            className="text-2xl font-bold"
            style={{ color: "#333", margin: 0, flex: 1 }}
          >
            Thanh toán
          </h1>
        </div>

        <Form form={form} onFinish={handleCheckout} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Địa chỉ nhận hàng */}
              <Card
                title={
                  <span
                    style={{ color: "#333", fontSize: "18px", fontWeight: 600 }}
                  >
                    <EnvironmentOutlined
                      style={{ color: "#008ECC", marginRight: "8px" }}
                    />
                    Địa chỉ nhận hàng
                  </span>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {addresses.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p style={{ color: "#666", marginBottom: "16px" }}>
                      Bạn chưa có địa chỉ nào
                    </p>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowAddressModal(true)}
                      style={{
                        backgroundColor: "#008ECC",
                        borderColor: "#008ECC",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleAddressChange(addr.id)}
                          style={{
                            border:
                              selectedAddressId === addr.id
                                ? "2px solid #008ECC"
                                : "1px solid #EDEDED",
                            borderRadius: "8px",
                            padding: "16px",
                            cursor: "pointer",
                            background:
                              selectedAddressId === addr.id
                                ? "#F0F8FF"
                                : "white",
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) => {
                            if (selectedAddressId !== addr.id) {
                              e.currentTarget.style.borderColor = "#008ECC";
                              e.currentTarget.style.background = "#F9F9F9";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedAddressId !== addr.id) {
                              e.currentTarget.style.borderColor = "#EDEDED";
                              e.currentTarget.style.background = "white";
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="radio"
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => handleAddressChange(addr.id)}
                                  style={{ cursor: "pointer" }}
                                />
                                <span
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    color: "#333",
                                  }}
                                >
                                  {addr.receiverName}
                                </span>
                                {addr.isDefault && (
                                  <Tag color="#008ECC" style={{ margin: 0 }}>
                                    Mặc định
                                  </Tag>
                                )}
                              </div>
                              <p
                                style={{
                                  color: "#666",
                                  fontSize: "14px",
                                  margin: "4px 0 0 24px",
                                }}
                              >
                                {addr.addressDetail}, {addr.provinceName}
                              </p>
                              <p
                                style={{
                                  color: "#999",
                                  fontSize: "13px",
                                  margin: "4px 0 0 24px",
                                }}
                              >
                                {addr.receiverPhone}
                              </p>
                            </div>
                            <Popconfirm
                              title="Xóa địa chỉ?"
                              description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                              onConfirm={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id, e);
                              }}
                              onCancel={(e) => e.stopPropagation()}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                type="text"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  color: "#FF4D4F",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                Xóa
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => setShowAddressModal(true)}
                      style={{
                        borderColor: "#008ECC",
                        color: "#008ECC",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </>
                )}
              </Card>

              {/* Đơn hàng theo seller */}
              {(filteredCheckoutData || checkoutData) && (
                <Card
                  title={
                    <span
                      style={{
                        color: "#333",
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      <ShopOutlined
                        style={{ color: "#008ECC", marginRight: "8px" }}
                      />
                      Đơn hàng
                    </span>
                  }
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {(filteredCheckoutData || checkoutData).sellerOrders.map(
                    (group, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom:
                            idx <
                            (filteredCheckoutData || checkoutData).sellerOrders
                              .length -
                              1
                              ? "24px"
                              : 0,
                          paddingBottom:
                            idx <
                            (filteredCheckoutData || checkoutData).sellerOrders
                              .length -
                              1
                              ? "24px"
                              : 0,
                          borderBottom:
                            idx <
                            (filteredCheckoutData || checkoutData).sellerOrders
                              .length -
                              1
                              ? "1px solid #EDEDED"
                              : "none",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: "#333",
                            marginBottom: "12px",
                          }}
                        >
                          Shop: {group.sellerName}
                        </h3>
                        <div
                          style={{
                            background: "#F9F9F9",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          {group.items.map((item) => (
                            <div
                              key={item.itemId}
                              className="flex justify-between mb-2"
                              style={{
                                paddingBottom: "8px",
                                borderBottom:
                                  group.items.indexOf(item) <
                                  group.items.length - 1
                                    ? "1px solid #EDEDED"
                                    : "none",
                              }}
                            >
                              <span style={{ color: "#333", fontSize: "14px" }}>
                                {item.productName} x {item.quantity}
                              </span>
                              <span
                                style={{
                                  color: "#666",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                }}
                              >
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div
                          className="flex justify-between"
                          style={{ padding: "4px 0" }}
                        >
                          <span style={{ color: "#666" }}>Tạm tính:</span>
                          <span style={{ color: "#333", fontWeight: 500 }}>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(group.subtotal)}
                          </span>
                        </div>
                        {/* Hiển thị mã giảm giá nếu có */}
                        {group.discountAmount && group.discountAmount > 0 && (
                          <div
                            className="flex justify-between"
                            style={{ padding: "10px 0" }}
                          >
                            <span style={{ color: "#008ECC" }}>
                              Mã giảm giá: {group.promotionCode}
                            </span>
                            <span style={{ color: "#FF4D4F", fontWeight: 600 }}>
                              -
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(group.discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div
                            className="flex justify-between"
                            style={{ padding: "4px 0" }}
                          >
                            <span style={{ color: "#666" }}>
                              Phí vận chuyển:
                            </span>
                            <span style={{ color: "#333", fontWeight: 500 }}>
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(group.shippingFee)}
                            </span>
                          </div>

                          <div
                            style={{ marginTop: "10px", marginBottom: "10px" }}
                          >
                            <button
                              type="button"
                              onClick={() => openPromotionModal(group.sellerId)}
                              style={{
                                background: "#008ECC",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              Chọn mã giảm giá
                            </button>
                          </div>
                          <div
                            className="flex justify-between font-bold"
                            style={{
                              padding: "8px 0 0 0",
                              borderTop: "1px solid #EDEDED",
                              marginTop: "8px",
                              color: "#FF4D4F",
                              fontSize: "16px",
                            }}
                          >
                            <span>Tổng:</span>
                            <span>
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(group.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </Card>
              )}

              {/* Phương thức thanh toán */}
              <Card
                title={
                  <span
                    style={{ color: "#333", fontSize: "18px", fontWeight: 600 }}
                  >
                    <CreditCardOutlined
                      style={{ color: "#008ECC", marginRight: "8px" }}
                    />
                    Phương thức thanh toán
                  </span>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <Radio
                    value="COD"
                    style={{
                      fontSize: "15px",
                      padding: "12px",
                      border: "1px solid #EDEDED",
                      borderRadius: "8px",
                    }}
                  >
                    Thanh toán khi nhận hàng (COD)
                  </Radio>
                  <Radio
                    value="VNPAY"
                    style={{
                      fontSize: "15px",
                      padding: "12px",
                      border: "1px solid #EDEDED",
                      borderRadius: "8px",
                    }}
                  >
                    Thanh toán qua VNPay
                  </Radio>
                </Radio.Group>
              </Card>

              {/* Ghi chú */}
              <Card
                title={
                  <span
                    style={{ color: "#333", fontSize: "18px", fontWeight: 600 }}
                  >
                    <FileTextOutlined
                      style={{ color: "#008ECC", marginRight: "8px" }}
                    />
                    Ghi chú
                  </span>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Form.Item name="note">
                  <TextArea
                    rows={4}
                    placeholder="Ghi chú cho người bán..."
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              </Card>
            </div>

            {/* Right Column - Tổng thanh toán */}
            <div className="lg:col-span-1">
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  position: "sticky",
                  top: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#333",
                    marginBottom: "20px",
                  }}
                >
                  Tổng thanh toán
                </h2>
                {(filteredCheckoutData || checkoutData) && (
                  <div className="space-y-3 mb-4">
                    <div
                      className="flex justify-between"
                      style={{ padding: "8px 0" }}
                    >
                      <span style={{ color: "#666", fontSize: "14px" }}>
                        Tạm tính:
                      </span>
                      <span
                        style={{
                          color: "#333",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          (filteredCheckoutData || checkoutData).totalAmount
                        )}
                      </span>
                    </div>

                    {/* Giảm giá */}
                    <div
                      className="flex justify-between"
                      style={{ padding: "8px 0" }}
                    >
                      <span style={{ color: "#666", fontSize: "14px" }}>
                        Giảm giá:
                      </span>

                      <span
                        style={{
                          color: "#FF4D4F",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        -
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          (
                            filteredCheckoutData || checkoutData
                          ).sellerOrders.reduce(
                            (sum, so) => sum + (so.discountAmount || 0),
                            0
                          )
                        )}
                      </span>
                    </div>

                    <div
                      className="flex justify-between"
                      style={{ padding: "8px 0" }}
                    >
                      <span style={{ color: "#666", fontSize: "14px" }}>
                        Phí vận chuyển:
                      </span>
                      <span
                        style={{
                          color: "#333",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          (filteredCheckoutData || checkoutData)
                            .totalShippingFee
                        )}
                      </span>
                    </div>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      className="flex justify-between font-bold"
                      style={{
                        padding: "8px 0",
                        color: "#FF4D4F",
                        fontSize: "18px",
                      }}
                    >
                      <span>Tổng cộng:</span>
                      <span>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          (filteredCheckoutData || checkoutData).finalAmount
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {(filteredCheckoutData || checkoutData) &&
                  (filteredCheckoutData || checkoutData).finalAmount >
                    49970000 && (
                    <div
                      style={{
                        marginBottom: "12px",
                        padding: "12px",
                        background: "#FFF7E6",
                        border: "1px solid #FFE58F",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#AD6800",
                      }}
                    >
                      Tổng đơn hàng gần đạt giới hạn 50 triệu VND. Vui lòng kiểm
                      tra lại.
                    </div>
                  )}
                {(filteredCheckoutData || checkoutData) &&
                  (filteredCheckoutData || checkoutData).finalAmount >
                    50000000 && (
                    <div
                      style={{
                        marginBottom: "12px",
                        padding: "12px",
                        background: "#FFF1F0",
                        border: "1px solid #FFCCC7",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#CF1322",
                      }}
                    >
                      Tổng đơn hàng vượt quá giới hạn 50 triệu VND. Vui lòng
                      quay lại giỏ hàng để giảm số lượng sản phẩm.
                    </div>
                  )}
                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={loading}
                  disabled={
                    (filteredCheckoutData || checkoutData) &&
                    (filteredCheckoutData || checkoutData).finalAmount >
                      50000000
                  }
                  style={{
                    backgroundColor: "#008ECC",
                    borderColor: "#008ECC",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckOutlined /> Đặt hàng
                </Button>
              </Card>
            </div>
          </div>
        </Form>

        {/* Modal chọn mã giảm giá */}
        <Modal
          title="Chọn mã giảm giá"
          open={openPromoModal}
          onCancel={() => setOpenPromoModal(false)}
          footer={null}
          width={600}
        >
          {/* ---- INPUT NHẬP MÃ GIẢM GIÁ ---- */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <Input
              placeholder="Nhập mã giảm giá..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <Button
              type="primary"
              onClick={() => handleSelectPromotion(manualCode, currentSellerId)}
            >
              Áp dụng
            </Button>
          </div>

          {/* ---- LIST VOUCHER ---- */}
          {!promotionList || promotionList.length === 0 ? (
            <p>Không có mã giảm giá nào.</p>
          ) : (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "350px", // scrollable
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              {promotionList
                .filter(
                  (p) => p.promotionStatus !== "Expired" && p.usageLimit > 0
                )
                .map((promo) => {
                  const isSellerPromo = promo.ownerType === "SELLER";
                  const ownerName =
                    promo.ownerName ||
                    (["SYSTEMADMIN", "CONTENTADMIN"].includes(promo.ownerType)
                      ? "Toàn sàn"
                      : isSellerPromo
                      ? "Shop hiện tại"
                      : "");

                  return (
                    <Card
                      key={promo.id}
                      onClick={() =>
                        handleSelectPromotion(
                          promo.promotionCode,
                          currentSellerId
                        )
                      }
                      hoverable
                      style={{
                        cursor: "pointer",
                        borderRadius: "14px",
                        border: isSellerPromo
                          ? "2px solid #008ECC"
                          : "1px solid #e5e7eb",
                        padding: 0,
                        background: isSellerPromo ? "#f0f9ff" : "white",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                        transition: "0.25s ease, box-shadow 0.25s ease",
                      }}
                      bodyStyle={{ padding: "14px 18px" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 6px 18px rgba(0,0,0,0.12), 0 0 0 1.5px #ff4d4f inset";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 3px 10px rgba(0,0,0,0.05)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                        }}
                      >
                        {/* LEFT INFO */}
                        <div style={{ flex: 2 }}>
                          {/* SHOP LABEL */}
                          {isSellerPromo && (
                            <div
                              style={{
                                display: "inline-block",
                                background: "#008ECC",
                                color: "white",
                                padding: "2px 8px",
                                fontSize: "11px",
                                borderRadius: "4px",
                                fontWeight: 600,
                                marginBottom: "6px",
                              }}
                            >
                              🏪 Dành cho {ownerName}
                            </div>
                          )}
                          {!isSellerPromo && (
                            <div
                              style={{
                                display: "inline-block",
                                background: "#52c41a",
                                color: "white",
                                padding: "2px 8px",
                                fontSize: "11px",
                                borderRadius: "4px",
                                fontWeight: 600,
                                marginBottom: "6px",
                              }}
                            >
                              🌐 {ownerName}
                            </div>
                          )}

                          {/* CODE SECTION */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginTop: "4px",
                            }}
                          >
                            <span
                              style={{
                                background:
                                  "linear-gradient(90deg,#ff4d4f,#ff7875)",
                                color: "white",
                                padding: "2px 8px",
                                fontSize: "12px",
                                borderRadius: "6px",
                                fontWeight: 600,
                              }}
                            >
                              {promo.promotionCode}
                            </span>

                            <span style={{ color: "#888", fontSize: 12 }}>
                              Voucher
                            </span>
                          </div>

                          {/* DESCRIPTION */}
                          <div
                            style={{
                              marginTop: 6,
                              marginBottom: 6,
                              color: "#444",
                              fontSize: 13,
                              lineHeight: "1.35",
                            }}
                          >
                            {promo.description}
                          </div>

                          {/* DISCOUNT */}
                          <div
                            style={{
                              color: "#ff4d4f",
                              fontWeight: 700,
                              fontSize: 16,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span style={{ fontSize: 18 }}>🏷️</span>
                            Giảm: {promo.discountValue}
                            {promo.discountType === "PERCENT" ? "%" : "đ"}
                          </div>

                          {promo.maxDiscountAmount && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                                marginTop: 4,
                              }}
                            >
                              Tối đa: {promo.maxDiscountAmount}đ
                            </div>
                          )}
                        </div>

                        {/* RIGHT INFO */}
                        <div
                          style={{
                            flex: 1,
                            fontSize: 12,
                            color: "#666",
                            textAlign: "right",
                          }}
                        >
                          <div>
                            Bắt đầu:{" "}
                            {dayjs(promo.startDate).format("DD/MM/YYYY")}
                          </div>
                          <div>
                            Kết thúc:{" "}
                            {dayjs(promo.endDate).format("DD/MM/YYYY")}
                          </div>

                          {/* OWNER TAG */}
                          <div
                            style={{
                              marginTop: 8,
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 6,
                              background:
                                promo.ownerType === "SELLER"
                                  ? "#fff7e6"
                                  : "#e6f7ff",
                              color:
                                promo.ownerType === "SELLER"
                                  ? "#d46b08"
                                  : "#096dd9",
                              fontWeight: 600,
                            }}
                          >
                            {ownerName}
                          </div>

                          {promo.usageLimit && (
                            <div style={{ marginTop: 6 }}>
                              Sử dụng tối đa: {promo.usageLimit}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </Modal>

        {/* Modal thêm địa chỉ */}
        <Modal
          title="Thêm địa chỉ mới"
          open={showAddressModal}
          onCancel={() => {
            setShowAddressModal(false);
            addressForm.resetFields();
          }}
          onOk={() => addressForm.submit()}
          width={700}
          okText="Thêm"
          cancelText="Hủy"
          okButtonProps={{
            style: { backgroundColor: "#008ECC", borderColor: "#008ECC" },
          }}
        >
          <Alert
            message="Lưu ý quan trọng"
            description="Địa chỉ phải đầy đủ và chính xác để GHN có thể giao hàng. Vui lòng nhập đầy đủ số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố."
            type="info"
            showIcon
            style={{ marginBottom: "20px" }}
          />
          <Form
            form={addressForm}
            onFinish={handleCreateAddress}
            layout="vertical"
          >
            <Form.Item
              name="receiverName"
              label="Tên người nhận"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input style={{ borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="receiverPhone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input style={{ borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="provinceId"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: "Vui lòng chọn tỉnh" }]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                onChange={(provinceId) => {
                  loadDistricts(provinceId);
                  addressForm.setFieldsValue({
                    districtId: null,
                    wardCode: null,
                  });
                }}
                style={{ borderRadius: "8px" }}
              >
                {provinces
                  .filter(
                    (p) => p && (p.provinceId != null || p.ProvinceID != null)
                  )
                  .map((p) => {
                    const id = p.provinceId || p.ProvinceID;
                    const name = p.provinceName || p.ProvinceName;
                    return (
                      <Option key={id} value={id}>
                        {name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              name="districtId"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                onChange={(districtId) => {
                  loadWards(districtId);
                  addressForm.setFieldsValue({ wardCode: null });
                }}
                style={{ borderRadius: "8px" }}
              >
                {districts
                  .filter(
                    (d) => d && (d.districtId != null || d.DistrictID != null)
                  )
                  .map((d) => {
                    const id = d.districtId || d.DistrictID;
                    const name = d.districtName || d.DistrictName;
                    return (
                      <Option key={id} value={id}>
                        {name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              name="wardCode"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                style={{ borderRadius: "8px" }}
              >
                {wards
                  .filter(
                    (w) => w && (w.wardCode != null || w.WardCode != null)
                  )
                  .map((w) => {
                    const code = w.wardCode || w.WardCode;
                    const name = w.wardName || w.WardName;
                    return (
                      <Option key={code} value={code}>
                        {name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              name="addressDetail"
              label="Địa chỉ cụ thể"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
                {
                  min: 15,
                  message:
                    "Địa chỉ phải có ít nhất 15 ký tự để đảm bảo đầy đủ thông tin",
                },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length < 15) {
                      return Promise.reject(
                        new Error(
                          "Địa chỉ quá ngắn. Vui lòng nhập đầy đủ: số nhà, tên đường/phố"
                        )
                      );
                    }
                    if (!/\d/.test(value)) {
                      console.warn(
                        "Địa chỉ nên có số nhà để dễ dàng giao hàng"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              extra={
                <div
                  style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#FF9800",
                      marginBottom: "4px",
                    }}
                  >
                    Lưu ý: Địa chỉ phải đầy đủ để GHN có thể xử lý đơn hàng
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Vui lòng nhập đầy đủ:</strong>
                  </div>
                  <ul style={{ marginLeft: "20px", marginBottom: "4px" }}>
                    <li>Số nhà (ví dụ: 123, 45A)</li>
                    <li>Tên đường/Phố (ví dụ: Nguyễn Huệ, Lê Lợi)</li>
                    <li>
                      Phường/Xã, Quận/Huyện, Tỉnh/Thành phố (đã chọn ở trên)
                    </li>
                  </ul>
                  <div style={{ color: "#008ECC", marginTop: "4px" }}>
                    <strong>Ví dụ:</strong> 123 Nguyễn Huệ, Phường Bến Nghé,
                    Quận 1, TP. Hồ Chí Minh
                  </div>
                </div>
              }
            >
              <Input.TextArea
                rows={4}
                placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                showCount
                maxLength={500}
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <HomeFooter />
    </div>
  );
};

export default CheckoutPage;
