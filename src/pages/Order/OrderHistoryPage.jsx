import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { OrderApi } from "../../api/commerce/OrderApi";
import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  Spin,
  Empty,
  Tag,
  Button,
  message,
  Descriptions,
  Modal,
  Form,
  Input,
  Rate,
  Select,
  Pagination,
  Upload,
} from "antd";
import {
  ShoppingOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  ShopOutlined,
  UserOutlined,
  CarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import { reviewApi } from "../../api/catalog/reviewApi";
import { productReportApi } from "../../api/catalog/productReportApi";
import mediaApi from "../../api/identity/mediaApi";

const { TextArea } = Input;

/**
 * Trang lịch sử đơn hàng - Redesigned
 */
const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isBuyerCancelConfirmOpen, setIsBuyerCancelConfirmOpen] =
    useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reportOrder, setReportOrder] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [buyerCancelOrderId, setBuyerCancelOrderId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [reviewForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const { user } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [total, setTotal] = useState(0);

  // Xác định xem đây là trang của buyer hay seller
  const isSellerPage =
    location.pathname.includes("/orders/seller") ||
    location.pathname.includes("/seller/orders");
  const userRole = (user?.user?.role || user?.role)?.toUpperCase();
  const isDetailPage = !!orderId;
  const buyerId =
    user?.user?.buyerId ||
    user?.buyerId ||
    user?.user?.id ||
    user?.id ||
    user?.user?.userId;

  useEffect(() => {
    if (isDetailPage) {
      loadOrderDetail();
    } else {
      loadOrders();
    }
  }, [isDetailPage, isSellerPage, orderId, currentPage, pageSize]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let res;
      const page = currentPage - 1; // Spring pagination starts from 0
      if (isSellerPage || userRole === "SELLER") {
        res = await OrderApi.getSellerOrders(page, pageSize);
      } else {
        res = await OrderApi.getBuyerOrders(page, pageSize);
      }

      // Handle paginated response
      if (res.data && res.data.content) {
        // Spring Page response
        setOrders(res.data.content);
        setTotal(res.data.totalElements || 0);
      } else if (Array.isArray(res.data)) {
        // Fallback for non-paginated response
        setOrders(res.data);
        setTotal(res.data.length);
      } else {
        setOrders([]);
        setTotal(0);
      }
    } catch (error) {
      message.error("Không thể tải đơn hàng");
      console.error(error);
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await OrderApi.getOrder(orderId);
      setOrderDetail(res.data);
    } catch (error) {
      message.error("Không thể tải chi tiết đơn hàng");
      console.error(error);
      if (location.pathname.startsWith("/seller")) {
        navigate("/seller/orders");
      } else if (location.pathname.startsWith("/user")) {
        navigate("/user/orders");
      } else if (isSellerPage) {
        navigate("/orders/seller");
      } else {
        navigate("/orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reason = null) => {
    try {
      await OrderApi.cancelOrder(orderId, reason);
      message.success("Hủy đơn hàng thành công");
      setIsCancelModalOpen(false);
      setCancelOrderId(null);
      cancelForm.resetFields();
      if (isDetailPage) {
        loadOrderDetail();
      } else {
        // Reset to page 1 when switching between buyer/seller
        setCurrentPage(1);
        loadOrders();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể hủy đơn hàng";
      message.error(errorMessage);
      console.error(error);
    }
  };

  const handleBuyerCancelOrder = (orderId) => {
    setBuyerCancelOrderId(orderId);
    setIsBuyerCancelConfirmOpen(true);
  };

  const handleConfirmBuyerCancel = async () => {
    if (buyerCancelOrderId) {
      await handleCancelOrder(buyerCancelOrderId);
      setIsBuyerCancelConfirmOpen(false);
      setBuyerCancelOrderId(null);
    }
  };

  const handleOpenCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setIsCancelModalOpen(true);
    cancelForm.resetFields();
  };

  const handleSubmitCancel = async () => {
    try {
      const values = await cancelForm.validateFields();
      setSubmittingCancel(true);
      await handleCancelOrder(cancelOrderId, values.reason);
    } catch (error) {
      if (error?.errorFields) {
        return; // Validation error, don't show message
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể hủy đơn hàng";
      message.error(errorMessage);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Paid":
        return "blue";
      case "Shipped":
        return "purple";
      case "Delivered":
        return "green";
      case "Cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Chờ thanh toán";
      case "Paid":
        return "Đã thanh toán";
      case "Shipped":
        return "Đang giao hàng";
      case "Delivered":
        return "Đã giao hàng";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleOpenReviewModal = (order) => {
    if (!order?.items?.length) {
      message.warning("Đơn hàng chưa có sản phẩm để đánh giá.");
      return;
    }
    setReviewOrder(order);
    reviewForm.setFieldsValue({
      productId: order.items[0]?.productId,
      rating: 5,
      comment: "",
    });
    setIsReviewModalOpen(true);
  };

  const handleOpenReportModal = (order) => {
    if (!order?.items?.length) {
      message.warning("Đơn hàng chưa có sản phẩm để báo cáo.");
      return;
    }
    setReportOrder(order);
    reportForm.setFieldsValue({
      productId: order.items[0]?.productId,
      reason: "",
    });
    setIsReportModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      const values = await reviewForm.validateFields();

      if (!buyerId) {
        message.error("Không xác định được tài khoản người mua.");
        return;
      }

      // Lấy orderDetailId từ reviewOrder.items theo productId
      const item = (reviewOrder?.items || []).find(
        (i) => i.productId === values.productId
      );

      if (!item?.orderDetailId) {
        message.error("Không xác định được chi tiết đơn hàng để đánh giá.");
        return;
      }

      setSubmittingReview(true);

      await reviewApi.createReview(values.productId, {
        productId: values.productId,
        buyerId,
        rating: values.rating,
        comment: values.comment,
        isVerifiedPurchase: true,
        orderDetailId: item.orderDetailId, // gửi orderDetailId
      });

      message.success("Đã gửi đánh giá cho sản phẩm.");
      // Cập nhật UI: đánh dấu item đã review
      setOrders((prev) =>
        prev.map((o) =>
          o.id === reviewOrder.id
            ? {
              ...o,
              items: o.items.map((item) =>
                item.productId === values.productId
                  ? { ...item, isReviewed: true }
                  : item
              ),
            }
            : o
        )
      );

      setIsReviewModalOpen(false);
      setReviewOrder(null);
      reviewForm.resetFields();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại.";
      message.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await mediaApi.uploadSingle(formData);
      const data = res.result || res.data || res;

      const newMedia = {
        url: data.url || data.secure_url,
        publicId: data.public_id || data.publicId,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      };

      // Pass the newMedia object to onSuccess so it gets stored in file.response
      onSuccess(newMedia);
    } catch (err) {
      console.error("Upload error:", err);
      onError(err);
      message.error("Không thể tải lên tệp");
    }
  };



  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handleCancelPreview = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleSubmitReport = async () => {
    try {
      // Validate form fields
      const values = await reportForm.validateFields();

      // Lấy orderDetailId từ reportOrder.items theo productId
      const item = (reportOrder?.items || []).find(
        (i) => i.productId === values.productId
      );

      if (!item?.orderDetailId) {
        message.error("Không xác định được chi tiết đơn hàng để báo cáo.");
        return;
      }

      setSubmittingReport(true);

      // Gửi request lên API
      const payload = {
        reason: values.reason,
        orderDetailId: item.orderDetailId,
      };

      // Extract media from fileList
      // Note: Ant Design Upload component stores the response from customRequest in file.response
      const mediaList = fileList
        .filter((file) => file.status === "done" && file.response)
        .map((file) => file.response);

      if (mediaList.length > 0) {
        payload.media = mediaList;
      }

      await productReportApi.createReport(values.productId, payload);

      message.success("Đã gửi báo cáo sản phẩm đến hệ thống.");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === reportOrder.id
            ? {
              ...o,
              items: o.items.map((it) =>
                it.productId === values.productId
                  ? { ...it, isReported: true }
                  : it
              ),
            }
            : o
        )
      );

      // Reset modal
      setIsReportModalOpen(false);
      setReportOrder(null);
      reportForm.resetFields();
      setFileList([]);
    } catch (error) {
      // Nếu lỗi từ validateFields, không làm gì
      if (error?.errorFields) {
        return;
      }

      // Lấy thông báo lỗi từ response hoặc mặc định
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi báo cáo. Vui lòng thử lại.";
      message.error(errorMessage);
    } finally {
      setSubmittingReport(false);
    }
  };

  const reviewProductOptions = (reviewOrder?.items || [])
    .filter((item) => !item.isReviewed)
    .map((item) => ({
      label: `${item.productName} x${item.quantity}`,
      value: item.productId,
    }));
  const reportProductOptions = (reportOrder?.items || [])
    .filter((item) => !item.isReported)
    .map((item) => ({
      label: `${item.productName} x${item.quantity}`,
      value: item.productId,
    }));

  // Xác định có phải seller page không để ẩn HomeHeader/HomeFooter
  // Nếu đang trong SellerLayout (path bắt đầu với /seller), không hiển thị HomeHeader/HomeFooter vì SellerLayout đã có header riêng
  const isInSellerLayout = location.pathname.startsWith("/seller");
  // Nếu đang trong UserLayout (path bắt đầu với /user), không hiển thị HomeHeader/HomeFooter vì UserLayout đã có header riêng
  const isInUserLayout = location.pathname.startsWith("/user");
  // Chỉ hiển thị HomeHeader/HomeFooter nếu KHÔNG trong SellerLayout và KHÔNG trong UserLayout và KHÔNG phải seller route cũ
  const shouldShowBuyerHeader =
    !isInSellerLayout &&
    !isInUserLayout &&
    !((isSellerPage || userRole === "SELLER") && !isInSellerLayout);

  if (loading) {
    if (isInSellerLayout || isInUserLayout) {
      return (
        <div
          className="flex justify-center items-center"
          style={{ minHeight: "60vh" }}
        >
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
        {shouldShowBuyerHeader && <HomeHeader />}
        <div
          className="flex justify-center items-center"
          style={{ minHeight: "60vh" }}
        >
          <Spin size="large" />
        </div>
        {shouldShowBuyerHeader && <HomeFooter />}
      </div>
    );
  }

  // Hiển thị chi tiết đơn hàng nếu có orderId
  if (isDetailPage && orderDetail) {
    const detailContent = (
      <div
        className={isInUserLayout ? "" : "container mx-auto px-4 py-8"}
        style={isInUserLayout ? {} : { maxWidth: "1200px" }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            if (isInSellerLayout) {
              navigate("/seller/orders");
            } else if (isInUserLayout) {
              navigate("/user/orders");
            } else if (isSellerPage) {
              navigate("/orders/seller");
            } else {
              navigate("/orders");
            }
          }}
          className="mb-4"
          style={{ marginBottom: "20px", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Quay lại
        </Button>

        {/* Header Card */}
        <Card
          className="mb-4"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1
                className="text-2xl font-bold mb-2 flex items-center gap-2"
                style={{ color: "#333", margin: 0 }}
              >
                <ShoppingOutlined style={{ color: "#008ECC" }} /> Đơn hàng #
                {orderDetail.orderId}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Tag
                  color={getStatusColor(orderDetail.orderStatus)}
                  style={{
                    fontSize: "14px",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  {getStatusText(orderDetail.orderStatus)}
                </Tag>
                <span style={{ color: "#666", fontSize: "14px" }}>
                  <CalendarOutlined />{" "}
                  {new Date(orderDetail.orderDate).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Info */}
        <Card
          className="mb-4"
          title="Thông tin đơn hàng"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đơn hàng">
              #{orderDetail.orderId}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(orderDetail.orderStatus)}>
                {getStatusText(orderDetail.orderStatus)}
              </Tag>
            </Descriptions.Item>
            {orderDetail.shippingStatus && (
              <Descriptions.Item
                label={
                  <span>
                    <CarOutlined /> Trạng thái vận chuyển
                  </span>
                }
              >
                <Tag color="blue">{orderDetail.shippingStatus}</Tag>
              </Descriptions.Item>
            )}
            {isSellerPage || userRole === "SELLER" ? (
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> Khách hàng
                  </span>
                }
              >
                {orderDetail.buyerName}
              </Descriptions.Item>
            ) : (
              <Descriptions.Item
                label={
                  <span>
                    <ShopOutlined /> Shop
                  </span>
                }
              >
                {orderDetail.sellerName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày đặt">
              {new Date(orderDetail.orderDate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            {orderDetail.trackingNumber && (
              <Descriptions.Item label="Mã vận đơn">
                {orderDetail.trackingNumber}
              </Descriptions.Item>
            )}
            {orderDetail.ghnOrderCode && (
              <Descriptions.Item label="Mã đơn GHN">
                {orderDetail.ghnOrderCode}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Products */}
        <Card
          className="mb-4"
          title="Sản phẩm"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div className="space-y-3">
            {orderDetail.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "#F9F9F9",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: "#333", margin: 0, fontSize: "16px" }}
                  >
                    {item.productName}
                  </p>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Số lượng: {item.quantity} x{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.unitPrice)}
                  </p>
                </div>
                <p
                  className="font-semibold"
                  style={{ color: "#FF4D4F", margin: 0, fontSize: "16px" }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Shipping Address */}
        <Card
          className="mb-4"
          title="Thông tin giao hàng"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {orderDetail.shippingAddress ? (
            <div>
              <p style={{ marginBottom: "8px", color: "#333" }}>
                <strong>Người nhận:</strong>{" "}
                {orderDetail.shippingAddress.receiverName}
              </p>
              <p style={{ marginBottom: "8px", color: "#333" }}>
                <strong>Số điện thoại:</strong>{" "}
                {orderDetail.shippingAddress.receiverPhone}
              </p>
              <p style={{ marginBottom: "8px", color: "#333" }}>
                <strong>Địa chỉ:</strong>{" "}
                {orderDetail.shippingAddress.addressDetail}
              </p>
              <p style={{ marginBottom: 0, color: "#333" }}>
                <strong>Khu vực:</strong> {orderDetail.shippingAddress.wardCode}
                , {orderDetail.shippingAddress.districtId},{" "}
                {orderDetail.shippingAddress.provinceName}
              </p>
            </div>
          ) : (
            <p style={{ color: "#999" }}>Chưa có thông tin địa chỉ giao hàng</p>
          )}
        </Card>

        {/* Payment Summary */}
        <Card
          className="mb-4"
          title="Tổng thanh toán"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div className="space-y-2">
            <div className="flex justify-between" style={{ padding: "8px 0" }}>
              <span style={{ color: "#666" }}>Tổng tiền hàng:</span>
              <span style={{ color: "#333", fontWeight: 500 }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(orderDetail.totalAmount)}
              </span>
            </div>
            {orderDetail.discountAmount && orderDetail.discountAmount > 0 && (
              <div
                className="flex justify-between text-green-600"
                style={{ padding: "8px 0" }}
              >
                <span>Giảm giá:</span>
                <span>
                  -
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(orderDetail.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between" style={{ padding: "8px 0" }}>
              <span style={{ color: "#666" }}>Phí vận chuyển:</span>
              <span style={{ color: "#333", fontWeight: 500 }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(orderDetail.shippingFee || 0)}
              </span>
            </div>
            <div
              className="flex justify-between text-xl font-bold border-t pt-3 mt-3"
              style={{ borderColor: "#EDEDED" }}
            >
              <span style={{ color: "#333" }}>Thành tiền:</span>
              <span style={{ color: "#FF4D4F" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(orderDetail.finalAmount)}
              </span>
            </div>
          </div>
        </Card>

        {/* Cancel Button
        {(orderDetail.orderStatus === "Pending" ||
          orderDetail.orderStatus === "Paid") && (
          <div style={{ marginTop: "20px" }}>
            {userRole === "SELLER" || isSellerPage ? (
              <Button
                danger
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => handleOpenCancelModal(orderDetail.orderId)}
              >
                Hủy đơn hàng
              </Button>
            ) : (
              <Button
                danger
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => handleBuyerCancelOrder(orderDetail.orderId)}
              >
                Hủy đơn hàng
              </Button>
            )}
          </div>
        )} */}
      </div>
    );

    if (isInSellerLayout || isInUserLayout) {
      return detailContent;
    }

    return (
      <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
        {shouldShowBuyerHeader && <HomeHeader />}
        {detailContent}
        {shouldShowBuyerHeader && <HomeFooter />}
      </div>
    );
  }

  // Hiển thị danh sách đơn hàng
  if (orders.length === 0) {
    const emptyContent = (
      <div
        className={
          isInSellerLayout || isInUserLayout
            ? ""
            : "container mx-auto px-4 py-8"
        }
        style={isInSellerLayout || isInUserLayout ? {} : { maxWidth: "1200px" }}
      >
        <Empty description="Chưa có đơn hàng nào" />
      </div>
    );

    if (isInSellerLayout || isInUserLayout) {
      return emptyContent;
    }

    return (
      <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
        {shouldShowBuyerHeader && <HomeHeader />}
        {emptyContent}
        {shouldShowBuyerHeader && <HomeFooter />}
      </div>
    );
  }

  // Nội dung danh sách đơn hàng
  const ordersListContent = (
    <div
      className={
        isInSellerLayout || isInUserLayout ? "" : "container mx-auto px-4 py-8"
      }
      style={isInSellerLayout || isInUserLayout ? {} : { maxWidth: "1200px" }}
    >
      {/* Header */}
      <div
        style={{
          background:
            isInSellerLayout || isInUserLayout ? "transparent" : "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow:
            isInSellerLayout || isInUserLayout
              ? "none"
              : "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          className="text-2xl font-bold flex items-center gap-2"
          style={{ color: "#333", margin: 0 }}
        >
          <ShoppingOutlined style={{ color: "#008ECC" }} /> Lịch sử đơn hàng
        </h1>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.orderId}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: "#333", margin: 0 }}
                >
                  Đơn hàng #{order.orderId}
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  {isSellerPage || userRole === "SELLER" ? (
                    <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                      <UserOutlined /> Khách hàng: {order.buyerName}
                    </p>
                  ) : (
                    <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                      <ShopOutlined /> Shop: {order.sellerName}
                    </p>
                  )}
                  <p style={{ color: "#999", margin: 0, fontSize: "14px" }}>
                    <CalendarOutlined />{" "}
                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <Tag
                color={getStatusColor(order.orderStatus)}
                style={{
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "6px",
                }}
              >
                {getStatusText(order.orderStatus)}
              </Tag>
            </div>

            {/* Order Items */}
            <div
              className="mb-4"
              style={{
                background: "#F9F9F9",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between mb-2"
                  style={{
                    paddingBottom: idx < order.items.length - 1 ? "8px" : 0,
                    borderBottom:
                      idx < order.items.length - 1
                        ? "1px solid #EDEDED"
                        : "none",
                  }}
                >
                  <span style={{ color: "#333", fontSize: "14px" }}>
                    {item.productName} x {item.quantity}
                  </span>
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="flex justify-between items-center border-t pt-4"
              style={{ borderColor: "#EDEDED" }}
            >
              <div>
                <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                  Tổng tiền:{" "}
                  <span
                    className="font-bold"
                    style={{ color: "#FF4D4F", fontSize: "16px" }}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.finalAmount)}
                  </span>
                </p>
                {order.trackingNumber && (
                  <p
                    style={{
                      color: "#999",
                      fontSize: "12px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Mã vận đơn: {order.trackingNumber}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button
                  onClick={() => {
                    if (isInSellerLayout) {
                      navigate(`/seller/orders/${order.orderId}`);
                    } else if (isInUserLayout) {
                      navigate(`/user/orders/${order.orderId}`);
                    } else if (isSellerPage || userRole === "SELLER") {
                      navigate(`/orders/seller/${order.orderId}`);
                    } else {
                      navigate(`/orders/${order.orderId}`);
                    }
                  }}
                  style={{
                    backgroundColor: "#008ECC",
                    borderColor: "#008ECC",
                    color: "white",
                  }}
                >
                  <EyeOutlined /> Xem chi tiết
                </Button>
                {!isSellerPage &&
                  userRole !== "SELLER" &&
                  order.orderStatus === "Delivered" && (
                    <>
                      {/* Hiển thị nút đánh giá CHỈ KHI còn ít nhất 1 sản phẩm chưa review */}
                      {order.items.some((item) => !item.isReviewed) && (
                        <Button onClick={() => handleOpenReviewModal(order)}>
                          Đánh giá đơn hàng
                        </Button>
                      )}
                      {order.items.some((item) => !item.isReported) && (
                        <Button onClick={() => handleOpenReportModal(order)}>
                          Report đơn hàng này
                        </Button>
                      )}
                    </>
                  )}
                {/* Buyer và Seller đều có thể hủy đơn */}
                {(order.orderStatus === "Pending" ||
                  order.orderStatus === "Paid") && (
                    <>
                      {userRole === "SELLER" || isSellerPage ? (
                        <Button
                          danger
                          onClick={() => handleOpenCancelModal(order.orderId)}
                        >
                          <CloseCircleOutlined /> Hủy đơn
                        </Button>
                      ) : (
                        <Button
                          danger
                          onClick={() => handleBuyerCancelOrder(order.orderId)}
                        >
                          <CloseCircleOutlined /> Hủy đơn
                        </Button>
                      )}
                    </>
                  )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`
            }
            pageSizeOptions={["5", "10", "20", "50"]}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
          />
        </div>
      )}

      <Modal
        title="Đánh giá đơn hàng"
        open={isReviewModalOpen}
        onOk={handleSubmitReview}
        onCancel={() => {
          setIsReviewModalOpen(false);
          setReviewOrder(null);
          reviewForm.resetFields();
        }}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        confirmLoading={submittingReview}
      >
        <Form layout="vertical" form={reviewForm}>
          <Form.Item
            name="productId"
            label="Chọn sản phẩm"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select
              placeholder="Chọn sản phẩm bạn muốn đánh giá"
              options={reviewProductOptions}
            />
          </Form.Item>
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Nhận xét"
            rules={[
              { required: true, message: "Vui lòng nhập nhận xét" },
              { min: 10, message: "Nhận xét tối thiểu 10 ký tự" },
            ]}
          >
            <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Báo cáo sản phẩm"
        open={isReportModalOpen}
        onOk={handleSubmitReport}
        onCancel={() => {
          setIsReportModalOpen(false);
          setReportOrder(null);
          setIsReportModalOpen(false);
          setReportOrder(null);
          reportForm.resetFields();
          setFileList([]);
          setUploadedMedia(null);
        }}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={submittingReport}
      >
        <Form layout="vertical" form={reportForm}>
          <Form.Item
            name="productId"
            label="Chọn sản phẩm"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select
              placeholder="Chọn sản phẩm bạn muốn đánh giá"
              options={reportProductOptions}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Lý do báo cáo"
            rules={[
              { required: true, message: "Vui lòng nhập lý do" },
              { min: 4, message: "Lý do tối thiểu 4 ký tự" },
            ]}
          >
            <TextArea rows={4} placeholder="Mô tả vấn đề bạn gặp phải" />
          </Form.Item>
          <Form.Item label="Hình ảnh/Video minh chứng">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleUploadChange}
              customRequest={customUploadRequest}
              maxCount={6}
              accept="image/*,video/*"
              beforeUpload={(file) => {
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  message.error("File phải nhỏ hơn 10MB!");
                }
                return isLt10M;
              }}
            >
              {fileList.length < 6 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelPreview}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>

      <Modal
        title="Hủy đơn hàng"
        open={isCancelModalOpen}
        onOk={handleSubmitCancel}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setCancelOrderId(null);
          cancelForm.resetFields();
        }}
        okText="Xác nhận hủy"
        cancelText="Hủy"
        confirmLoading={submittingCancel}
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical" form={cancelForm}>
          <Form.Item
            name="reason"
            label="Lý do hủy đơn"
            rules={[
              { required: true, message: "Vui lòng nhập lý do hủy đơn" },
              { min: 10, message: "Lý do tối thiểu 10 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Vui lòng nhập lý do hủy đơn hàng (tối thiểu 10 ký tự)"
            />
          </Form.Item>
          <p style={{ color: "#999", fontSize: "12px", marginTop: "-10px" }}>
            Lý do hủy đơn sẽ được gửi đến người mua qua email.
          </p>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isBuyerCancelConfirmOpen}
        onOk={handleConfirmBuyerCancel}
        onCancel={() => {
          setIsBuyerCancelConfirmOpen(false);
          setBuyerCancelOrderId(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
      </Modal>
    </div >
  );

  if (isInSellerLayout || isInUserLayout) {
    return ordersListContent;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5FA" }}>
      {shouldShowBuyerHeader && <HomeHeader />}
      {ordersListContent}
      {shouldShowBuyerHeader && <HomeFooter />}
    </div>
  );
};

export default OrderHistoryPage;
