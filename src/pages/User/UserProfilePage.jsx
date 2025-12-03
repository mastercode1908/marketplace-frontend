/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  Avatar,
  Upload,
  Spin,
  Modal,
  Checkbox,
  Card,
  Image,
  Empty,
  Popconfirm,
  Pagination,
} from "antd";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import arraySupport from "dayjs/plugin/arraySupport";
dayjs.extend(arraySupport);
import axios from "axios";
import {
  UserOutlined,
  BellOutlined,
  ShoppingOutlined,
  GiftOutlined,
  EditOutlined,
  CameraOutlined,
  HeartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import userApi from "../../api/identity/UserProfileApi";
import mediaApi from "../../api/identity/mediaApi";
import { useAuth } from "../../hooks/useAuth";
import wishlistApi from "../../api/commerce/wishlistApi";
import notificationApi from "../../api/communication/NotificationApi";
import categoryApi from "../../api/catalog/categoryApi";
import "../../styles/UserProfilePage.css";

const { Option } = Select;

// Address Management Component
function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  const fetchAddresses = async () => {
    setFetching(true);
    try {
      const res = await userApi.getAddresses();
      setAddresses(res || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setFetching(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await userApi.getProvinces();
      setProvinces(res || []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setWards([]);
    form.setFieldsValue({ districtId: null, wardCode: null });

    if (provinceId) {
      try {
        const res = await userApi.getDistricts(provinceId);
        setDistricts(res || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setWards([]);
    form.setFieldsValue({ wardCode: null });

    if (districtId) {
      try {
        const res = await userApi.getWards(districtId);
        setWards(res || []);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    form.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
    setIsModalVisible(true);
  };

  const handleEdit = async (address) => {
    setEditingAddress(address);
    form.setFieldsValue({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      addressDetail: address.addressDetail,
      provinceName: address.provinceName,
      districtId: address.districtId,
      wardCode: address.wardCode,
    });

    // Load districts and wards
    if (address.districtId) {
      try {
        const provinceRes = await userApi.getProvinces();
        const province = provinceRes?.find(
          (p) =>
            address.provinceName?.includes(p.ProvinceName) ||
            address.provinceName?.includes(p.Name)
        );
        if (province) {
          setSelectedProvince(province.ProvinceID || province.Id);
          const districtRes = await userApi.getDistricts(
            province.ProvinceID || province.Id
          );
          setDistricts(districtRes || []);
          setSelectedDistrict(address.districtId);
          const wardRes = await userApi.getWards(address.districtId);
          setWards(wardRes || []);
        }
      } catch (error) {
        console.error("Error loading address data:", error);
      }
    }

    setIsModalVisible(true);
  };

  const handleDelete = async (addressId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await userApi.deleteAddress(addressId);
          toast.success("Xóa địa chỉ thành công!");
          Modal.success({
            title: "Thành công",
            content: "Xóa địa chỉ thành công!",
            okText: "Đóng",
          });
          fetchAddresses();
        } catch (error) {
          console.error("Error deleting address:", error);
          toast.error("Không thể xóa địa chỉ");
        }
      },
    });
  };

  const handleSetDefault = async (addressId) => {
    try {
      await userApi.setDefaultAddress(addressId);
      toast.success("Đặt địa chỉ mặc định thành công!");
      Modal.success({
        title: "Thành công",
        content: "Đặt địa chỉ mặc định thành công!",
        okText: "Đóng",
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Không thể đặt địa chỉ mặc định");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validate province được chọn
      if (!selectedProvince) {
        toast.error("Vui lòng chọn tỉnh/thành phố");
        setLoading(false);
        return;
      }

      // Lấy provinceName từ danh sách provinces dựa trên selectedProvince
      const selectedProvinceObj = provinces.find(
        (p) =>
          p.ProvinceID === selectedProvince ||
          p.Id === selectedProvince ||
          p.provinceId === selectedProvince
      );

      if (!selectedProvinceObj) {
        toast.error("Không tìm thấy thông tin tỉnh/thành phố");
        setLoading(false);
        return;
      }

      const provinceName =
        selectedProvinceObj.ProvinceName ||
        selectedProvinceObj.provinceName ||
        selectedProvinceObj.Name ||
        "";

      const addressData = {
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        addressDetail: values.addressDetail,
        wardCode: values.wardCode,
        districtId: values.districtId,
        provinceName:
          values.provinceName ||
          provinces.find(
            (p) =>
              p.ProvinceID === selectedProvince || p.Id === selectedProvince
          )?.ProvinceName ||
          provinces.find(
            (p) =>
              p.ProvinceID === selectedProvince || p.Id === selectedProvince
          )?.Name,
        isDefault: values.isDefault || false,
      };

      if (editingAddress) {
        await userApi.updateAddress(editingAddress.id, addressData);
        toast.success("Cập nhật địa chỉ thành công!");
        Modal.success({
          title: "Thành công",
          content: "Cập nhật địa chỉ thành công!",
          okText: "Đóng",
        });
      } else {
        await userApi.createAddress(addressData);
        toast.success("Thêm địa chỉ thành công!");
        Modal.success({
          title: "Thành công",
          content: "Thêm địa chỉ thành công!",
          okText: "Đóng",
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.response?.data?.message || "Không thể lưu địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    if (phone.startsWith("0")) {
      return `(+84) ${phone
        .slice(1)
        .replace(/(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3")}`;
    }
    return phone;
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Đang tải danh sách địa chỉ...</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 className="content-title">Địa chỉ của tôi</h1>
        <Button
          type="primary"
          danger
          size="large"
          onClick={handleAddNew}
          style={{ backgroundColor: "#FF4D4F", borderColor: "#FF4D4F" }}
        >
          + Thêm địa chỉ mới
        </Button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
          Địa chỉ
        </h2>
        {addresses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <p>Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới!</p>
          </div>
        ) : (
          <div>
            {addresses.map((address, index) => (
              <div
                key={address.id}
                style={{
                  borderBottom:
                    index < addresses.length - 1 ? "1px solid #EDEDED" : "none",
                  padding: "20px 0",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "8px" }}>
                      <strong style={{ fontSize: "16px" }}>
                        {address.receiverName}
                      </strong>
                    </div>
                    <div style={{ marginBottom: "4px", color: "#666" }}>
                      {formatPhoneNumber(address.receiverPhone)}
                    </div>
                    <div style={{ marginBottom: "8px", color: "#666" }}>
                      {address.addressDetail}, {address.wardCode},{" "}
                      {address.provinceName}
                    </div>
                    {address.isDefault && (
                      <div style={{ marginTop: "8px" }}>
                        <span
                          style={{
                            backgroundColor: "#FF4D4F",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          Mặc định
                        </span>
                      </div>
                    )}
                    {!address.isDefault && address.addressType && (
                      <div style={{ marginTop: "8px" }}>
                        <span
                          style={{
                            backgroundColor: "#D9D9D9",
                            color: "#666",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          {address.addressType}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <Button
                      type="link"
                      onClick={() => handleEdit(address)}
                      style={{ padding: 0 }}
                    >
                      Cập nhật
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button
                          type="link"
                          danger
                          onClick={() => handleDelete(address.id)}
                          style={{ padding: 0 }}
                        >
                          Xóa
                        </Button>
                        <Button
                          style={{
                            backgroundColor: "#D9D9D9",
                            borderColor: "#D9D9D9",
                            color: "#666",
                          }}
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Thiết lập mặc định
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedProvince(null);
          setSelectedDistrict(null);
          setDistricts([]);
          setWards([]);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên người nhận"
            name="receiverName"
            rules={[
              { required: true, message: "Vui lòng nhập tên người nhận" },
            ]}
          >
            <Input placeholder="Nhập tên người nhận" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="receiverPhone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại phải có 10-11 chữ số",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Tỉnh/Thành phố"
            rules={[
              { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
            ]}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              onChange={handleProvinceChange}
              value={selectedProvince}
            >
              {provinces.map((province) => (
                <Option
                  key={
                    province.ProvinceID || province.Id || province.provinceId
                  }
                  value={
                    province.ProvinceID || province.Id || province.provinceId
                  }
                >
                  {province.ProvinceName ||
                    province.provinceName ||
                    province.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quận/Huyện"
            name="districtId"
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
          >
            <Select
              placeholder="Chọn quận/huyện"
              onChange={handleDistrictChange}
              value={selectedDistrict}
              disabled={!selectedProvince}
            >
              {districts.map((district) => (
                <Option
                  key={district.DistrictID || district.Id}
                  value={district.DistrictID || district.Id}
                >
                  {district.DistrictName || district.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phường/Xã"
            name="wardCode"
            rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
          >
            <Select placeholder="Chọn phường/xã" disabled={!selectedDistrict}>
              {wards.map((ward) => (
                <Option
                  key={ward.WardCode || ward.Code}
                  value={ward.WardCode || ward.Code}
                >
                  {ward.WardName || ward.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Địa chỉ chi tiết"
            name="addressDetail"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ chi tiết" },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập số nhà, tên đường, ..."
              rows={3}
            />
          </Form.Item>

          {!editingAddress && (
            <Form.Item name="isDefault" valuePropName="checked">
              <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingAddress ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const normalizeNotifications = (data) => {
    const records = Array.isArray(data) ? data : data?.data || [];
    return records.map((item) => {
      let createdAt = item.createdAt || item.created_at || item.timestamp;
      let timestamp = dayjs(createdAt).valueOf();
      if (isNaN(timestamp)) timestamp = dayjs().valueOf();

      // Check both isRead (new) and is_Read (old) for backward compatibility
      const isRead = item.isRead === true || item.isRead === "true" ||
        item.is_Read === true || item.is_Read === "true" ||
        item.read === true || item.read === "true";

      return {
        id: item.id || item.notificationId || item.notification_id,
        title: item.title || "Thông báo",
        message: item.message || item.content || "",
        type: item.type || item.notificationType || "System",
        read: isRead,
        createdAt: timestamp,
      };
    });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getUserNotifications();
      const normalized = normalizeNotifications(res.data).sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
      setNotifications(normalized);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (value) => {
    if (!value) return "";
    return dayjs(value).format("HH:mm:ss DD/MM/YYYY");
  };

  const handleViewDetail = async (notification) => {
    setSelectedNotification(notification);
    setDetailVisible(true);
    if (!notification.read && notification.id && !String(notification.id).startsWith("temp-")) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      try {
        await notificationApi.markAsRead(notification.id);
        // Refetch to ensure we have the latest state from backend
        await fetchNotifications();
      } catch (error) {
        console.error("Error marking notification:", error);
        toast.error("Không thể đánh dấu thông báo là đã đọc");
        // Revert optimistic update on error
        await fetchNotifications();
      }
    }
  };

  return (
    <div className="notifications-section" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="content-title" style={{ marginBottom: "4px" }}>
            Thông báo
          </h1>
          <p className="content-description">
            Theo dõi các cập nhật mới nhất từ MegaMart
          </p>
        </div>
        <Button onClick={fetchNotifications} loading={loading}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="Chưa có thông báo" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {notifications.map((notification) => (
            <div
              key={notification.id || Math.random()}
              style={{
                border: "1px solid #EDEDED",
                borderRadius: "16px",
                padding: "20px",
                background: notification.read ? "#FFFFFF" : "#EEF6FF",
                boxShadow: "0 6px 20px rgba(9, 9, 38, 0.05)",
                cursor: "pointer",
              }}
              onClick={() => handleViewDetail(notification)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      color: "#212844",
                      fontWeight: notification.read ? 500 : 700,
                    }}
                  >
                    {notification.title}
                  </h3>
                  {notification.createdAt && (
                    <p style={{ margin: "4px 0 0", color: "#7D89B0" }}>
                      {formatDate(notification.createdAt)}
                    </p>
                  )}
                </div>
                {!notification.read && (
                  <span
                    style={{
                      background: "#FFEEF0",
                      color: "#FF4D4F",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Mới
                  </span>
                )}
              </div>
              <p style={{ marginBottom: "12px", color: "#505988" }}>
                {notification.message}
              </p>
              <Button
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetail(notification);
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={detailVisible}
        title={selectedNotification?.title || "Thông báo"}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailVisible(false)}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedNotification ? (
          <div>
            <p style={{ whiteSpace: "pre-line" }}>
              {selectedNotification.message}
            </p>
          </div>
        ) : (
          <Empty description="Không có thông tin" />
        )}
      </Modal>
    </div>
  );
}

function WishlistSection() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(6);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const normalizeWishlist = (data) => {
    if (!data) return [];
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data)) return data;
    return [];
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const fetchWishlist = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const res = await wishlistApi.getAll(pageNumber, pageSize);
      const items = normalizeWishlist(res);
      setWishlist(items);
      setPage(res.number || 0);
      setTotalPages(res.totalPages || 0);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Không thể tải wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getPublicCategories();
      setCategories(res || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleRemoveProduct = async (productId) => {
    setRemovingId(productId);
    try {
      await wishlistApi.removeProduct(productId);
      toast.success("Đã xóa khỏi wishlist");
      fetchWishlist(page); // Refresh current page
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setRemovingId(null);
    }
  };

  const filteredWishlist = wishlist.filter((item) => {
    const matchesSearch = item.productName?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="wishlist-section" style={{ width: "100%" }}>
      <div className="wishlist-header">
        <div>
          <h1 className="content-title">Wishlist ({wishlist.length})</h1>
          <p className="content-description">
            Danh sách sản phẩm bạn yêu thích
          </p>
        </div>
        <div className="wishlist-actions">
          <Input
            placeholder="Tìm kiếm trong wishlist..."
            prefix={<UserOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Tất cả danh mục"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => setSelectedCategory(value)}
          >
            <Option value={null}>Tất cả danh mục</Option>
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Button onClick={() => fetchWishlist(page)} loading={loading}>
            Làm mới
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : filteredWishlist.length === 0 ? (
        <div className="wishlist-empty">
          <Empty
            description={
              searchText ? "Không tìm thấy sản phẩm phù hợp" : "Wishlist trống"
            }
          >
            {!searchText && (
              <Button type="primary" onClick={() => navigate("/")}>
                Khám phá sản phẩm
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {filteredWishlist.map((item) => (
              <Card
                key={item.id || item.productId}
                hoverable
                className="wishlist-card"
                cover={
                  <div className="wishlist-card-cover">
                    <Image
                      alt={item.productName}
                      src={
                        item.media?.[0]?.url ||
                        "https://via.placeholder.com/200"
                      }
                      fallback="https://via.placeholder.com/200"
                      preview={false}
                      onClick={() => navigate(`/product/${item.productId}`)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                }
              >
                <div className="wishlist-card-body">
                  <div
                    className="wishlist-card-title"
                    onClick={() => navigate(`/product/${item.productId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.productName}
                  </div>
                  <div className="wishlist-card-meta">
                    <div className="wishlist-price">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="wishlist-card-actions">
                    <Button
                      type="primary"
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate(`/product/${item.productId}`)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Xem chi tiết
                    </Button>
                    <Popconfirm
                      title="Xóa khỏi wishlist?"
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{
                        danger: true,
                        loading: removingId === item.productId,
                      }}
                      onConfirm={() => handleRemoveProduct(item.productId)}
                    >
                      <Button danger loading={removingId === item.productId}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination with Ant Design */}
          {totalPages > 1 && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Pagination
                current={page + 1}
                total={totalPages * pageSize}
                pageSize={pageSize}
                onChange={(pageNumber) => fetchWishlist(pageNumber - 1)}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(
    searchParams.get("tab") || "profile"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveMenu(tab);
    } else {
      setActiveMenu("profile");
    }
  }, [location.search, searchParams]);
  const [avatarFile, setAvatarFile] = useState(null); // Lưu file để upload khi save
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState(null); // Lưu URL ảnh vừa upload

  // Generate days, months, years for date picker
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    // Kiểm tra user từ context hoặc localStorage
    const localUserStr = localStorage.getItem("user");
    let hasUser = user;

    if (!hasUser && localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        hasUser = localUser?.user || localUser;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    if (!hasUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setFetching(true);
      try {
        const res = await userApi.getCurrentProfile();

        // Response structure: { user: { ... } } hoặc trực tiếp { ... }
        const userData = res.user || res;

        // Parse date of birth
        let day = null,
          month = null,
          year = null;
        if (userData.dob || userData.dateOfBirth) {
          const dob = new Date(userData.dob || userData.dateOfBirth);
          day = dob.getDate();
          month = dob.getMonth() + 1;
          year = dob.getFullYear();
        }

        setProfileData(userData);

        form.setFieldsValue({
          username: userData.username || "",
          fullName: userData.full_name || userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          gender:
            userData.gender === true
              ? "Nam"
              : userData.gender === false
                ? "Nữ"
                : "Khác",
          day: day,
          month: month,
          year: year,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);

        // Nếu lỗi 500 hoặc buyer không tồn tại, thử dùng thông tin từ user context
        if (error.response?.status === 500 || error.response?.status === 404) {
          console.log("Sử dụng thông tin từ user context làm fallback");
          if (user) {
            const fallbackData = {
              username: user.username || user.user?.username || "",
              fullName: user.fullName || user.user?.fullName || "",
              email: user.email || user.user?.email || "",
              phone: user.phone || user.user?.phone || "",
              gender: user.gender || user.user?.gender,
              dateOfBirth: null,
              avatarUrl:
                user.avatar ||
                user.profilePicture ||
                user.user?.avatarUrl ||
                "",
            };

            setProfileData(fallbackData);
            form.setFieldsValue({
              username: fallbackData.username,
              fullName: fallbackData.fullName,
              email: fallbackData.email,
              phone: fallbackData.phone,
              gender:
                fallbackData.gender === true
                  ? "Nam"
                  : fallbackData.gender === false
                    ? "Nữ"
                    : "Khác",
              day: null,
              month: null,
              year: null,
            });
            toast.error(
              "Không thể tải thông tin profile. Vui lòng đăng nhập lại."
            );
          }
        } else {
          toast.error("Không thể tải thông tin profile");
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, navigate, form]);

  const handleUploadAvatar = async (file) => {
    if (!file) return;

    try {
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading avatar...", file);
      const res = await mediaApi.uploadSingle(formData);
      console.log("Upload response:", res);

      // Handle various response structures
      const newAvatarUrl =
        res?.url || res?.data?.url || res?.result?.url || res?.data;

      if (newAvatarUrl && typeof newAvatarUrl === "string") {
        // Update local state with new avatar URL
        setUploadedAvatarUrl(newAvatarUrl);

        toast.success("Tải ảnh đại diện thành công! Hãy bấm Lưu để cập nhật.");
      } else {
        console.error("Invalid upload response format:", res);
        toast.error("Không nhận được đường dẫn ảnh từ server");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      const errorMsg = error.response?.data?.message || "Tải ảnh thất bại";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file) => {
      handleUploadAvatar(file);
      return false; // Prevent default upload behavior
    },
  };

  const onFinish = async (values) => {
    setLoading(true);

    // Đảm bảo accessToken tồn tại trước khi update
    const accessTokenBeforeUpdate = localStorage.getItem("accessToken");
    if (!accessTokenBeforeUpdate) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      // Convert gender
      let gender = null;
      if (values.gender === "Nam") gender = true;
      else if (values.gender === "Nữ") gender = false;
      else gender = null;

      // Convert date of birth
      let dob = null;
      if (values.day && values.month && values.year) {
        dob = `${values.year}-${String(values.month).padStart(2, "0")}-${String(
          values.day
        ).padStart(2, "0")}`;
      }

      // Xử lý avatar: ưu tiên lấy từ uploadedAvatarUrl (ảnh vừa upload xong)
      let avatarUrl =
        uploadedAvatarUrl ||
        user?.avatar ||
        user?.avatarUrl ||
        user?.profilePicture ||
        profileData?.avatarUrl ||
        profileData?.avata ||
        profileData?.avatar ||
        "";

      // Format data theo BuyerUpdateRequest structure từ backend
      const updateData = {
        username: values.username, // Giữ nguyên username
        email: profileData?.email || user?.email, // Giữ nguyên email
        fullName: values.fullName,
        phone: values.phone,
        gender: gender,
        dob: dob,
        avata: avatarUrl,
      };

      console.log("Starting profile update...");
      const res = await userApi.updateCurrentProfile(updateData);
      console.log("Profile update successful:", res);

      // Response từ update là BuyerResponse với đầy đủ thông tin
      // res.data là BuyerResponse từ ResponseEntity.ok(updatedBuyer)
      // Nếu res đã là BuyerResponse trực tiếp, dùng res; nếu không, dùng res.data
      const updatedUserData = res.data || res || profileData;

      // Update local state với data từ response
      setProfileData(updatedUserData);

      // Clear avatar file sau khi save thành công
      setAvatarFile(null);
      setUploadedAvatarUrl(null);

      // Update context với data mới
      // BuyerResponse có avatarUrl, không có avata
      const newAvatarUrl =
        updatedUserData.avatarUrl ||
        updatedUserData.avata ||
        updatedUserData.avatar ||
        "";
      const newFullName =
        updatedUserData.fullName ||
        updatedUserData.full_name ||
        values.fullName;

      // Cập nhật context với avatar và fullName mới
      // Giữ nguyên cấu trúc user hiện tại để tránh mất dữ liệu
      const updatedUserContext = {
        ...user,
        ...updatedUserData,
        fullName: newFullName,
        avatar: newAvatarUrl,
        profilePicture: newAvatarUrl,
        avata: newAvatarUrl,
        avatarUrl: newAvatarUrl,
        // Đảm bảo các field quan trọng không bị mất
        id: updatedUserData.buyerId || updatedUserData.id || user?.id,
        username: updatedUserData.username || user?.username,
        email: updatedUserData.email || user?.email,
      };

      setUser(updatedUserContext);

      // Force update localStorage ngay lập tức để header có thể lấy avatar
      const currentLocalUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentLocalUser.data?.user) {
        currentLocalUser.data.user.avatarUrl = newAvatarUrl;
        currentLocalUser.data.user.avata = newAvatarUrl;
        currentLocalUser.data.user.fullName = newFullName;
      } else if (currentLocalUser.user) {
        currentLocalUser.user.avatarUrl = newAvatarUrl;
        currentLocalUser.user.avata = newAvatarUrl;
        currentLocalUser.user.fullName = newFullName;
      } else {
        currentLocalUser.avatarUrl = newAvatarUrl;
        currentLocalUser.avata = newAvatarUrl;
        currentLocalUser.fullName = newFullName;
      }
      // Đảm bảo accessToken không bị mất
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      localStorage.setItem("user", JSON.stringify(currentLocalUser));

      // Đảm bảo accessToken vẫn còn sau khi update
      const accessTokenAfterUpdate = localStorage.getItem("accessToken");
      if (!accessTokenAfterUpdate && accessTokenBeforeUpdate) {
        // Nếu token bị mất, khôi phục lại
        localStorage.setItem("accessToken", accessTokenBeforeUpdate);
      }

      // Hiển thị thông báo thành công
      toast.success("Cập nhật thông tin thành công!");

      // Đảm bảo token vẫn còn sau khi update thành công
      const finalToken = localStorage.getItem("accessToken");
      if (!finalToken) {
        console.error("Token bị mất sau khi update thành công!");
        if (accessTokenBeforeUpdate) {
          localStorage.setItem("accessToken", accessTokenBeforeUpdate);
          console.log("Đã khôi phục token");
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);

      // Nếu lỗi 401, thử refresh token một lần nữa trước khi báo lỗi
      if (error.response?.status === 401) {
        try {
          // Thử refresh token
          const refreshRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}auth/refresh`,
            {},
            { withCredentials: true }
          );

          const newAccessToken =
            refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken;
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            toast.error("Phiên đăng nhập đã được làm mới. Vui lòng thử lại.");
            // Không tự động retry, để user tự ấn lại nút Lưu
          } else {
            throw new Error("Không thể lấy accessToken mới");
          }
        } catch (refreshError) {
          console.error(
            "Refresh token thất bại trong catch block:",
            refreshError
          );

          // Kiểm tra xem token có còn không
          const currentToken = localStorage.getItem("accessToken");
          if (!currentToken && accessTokenBeforeUpdate) {
            // Khôi phục token nếu bị mất
            localStorage.setItem("accessToken", accessTokenBeforeUpdate);
            toast.error("Phiên đăng nhập có vấn đề. Vui lòng thử lại.");
          } else {
            const errorMsg =
              error.response?.data?.message ||
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            toast.error(errorMsg);
            // Chỉ redirect nếu thực sự cần thiết (token không thể refresh)
            setTimeout(() => {
              if (!localStorage.getItem("accessToken")) {
                navigate("/login");
              }
            }, 2000);
          }
        }
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Cập nhật thất bại. Vui lòng thử lại.";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  const displayName =
    profileData?.full_name ||
    profileData?.fullName ||
    user?.fullName ||
    "Người dùng";

  const avatarUrl =
    uploadedAvatarUrl ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.profilePicture ||
    profileData?.avatarUrl ||
    profileData?.avata ||
    profileData?.avatar;

  return (
    <div className="user-profile-content w-full">
      {activeMenu === "notifications" && <NotificationsSection />}
      {activeMenu === "profile" && (
        <>
          <div className="profile-main-body">
            <div className="profile-left-section">
              <h1 className="content-title">Hồ Sơ Của Tôi</h1>
              <p className="content-description">
                Quản lý thông tin hồ sơ để bảo mật tài khoản
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="profile-form"
              >
                <div className="form-row">
                  <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    className="form-item-half"
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item
                    label="Tên"
                    name="fullName"
                    className="form-item-half"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên" },
                      { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
                      { max: 50, message: "Tên không được quá 50 ký tự" },
                    ]}
                  >
                    <Input placeholder="Nhập tên của bạn" />
                  </Form.Item>
                </div>

                <div className="form-row">
                  <Form.Item
                    label="Email"
                    name="email"
                    className="form-item-half"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input type="email" disabled />
                  </Form.Item>

                  <Form.Item
                    label="Số Điện Thoại"
                    name="phone"
                    className="form-item-half"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại phải có 10-11 chữ số",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </div>

                <Form.Item label="Giới Tính" name="gender">
                  <Radio.Group>
                    <Radio value="Nam">Nam</Radio>
                    <Radio value="Nữ">Nữ</Radio>
                    <Radio value="Khác">Khác</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="Ngày Sinh">
                  <div className="date-picker-group">
                    <Form.Item name="day" noStyle>
                      <Select placeholder="Ngày" className="date-select">
                        {days.map((day) => (
                          <Option key={day} value={day}>
                            {day}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="month" noStyle>
                      <Select placeholder="Tháng" className="date-select">
                        {months.map((month) => (
                          <Option key={month.value} value={month.value}>
                            {month.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="year" noStyle>
                      <Select placeholder="Năm" className="date-select">
                        {years.map((year) => (
                          <Option key={year} value={year}>
                            {year}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </Form.Item>

                <div className="form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="save-button"
                  >
                    Lưu
                  </Button>
                </div>
              </Form>
            </div>

            {/* Avatar Upload */}
            <div className="avatar-upload-section">
              <Avatar size={120} src={avatarUrl} icon={<UserOutlined />} />
              <Upload {...uploadProps}>
                <Button className="upload-button" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CameraOutlined /> Chọn Ảnh
                </Button>
              </Upload>
            </div>
          </div>
        </>
      )}

      {activeMenu === "address" && <AddressManagement />}

      {activeMenu === "wishlist" && <WishlistSection />}

      {activeMenu === "password" && (
        <div>
          <h1 className="content-title">Đổi Mật Khẩu</h1>
          <p className="content-description">Thay đổi mật khẩu của bạn</p>
          <div className="max-w-md">
            <Form
              layout="vertical"
              onFinish={async (values) => {
                if (values.newPassword !== values.confirmPassword) {
                  toast.error("Mật khẩu xác nhận không khớp");
                  return;
                }
                try {
                  setLoading(true);
                  await import("../../api/identity/authApi").then(module => module.default.changePassword({
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword
                  }));
                  toast.success("Đổi mật khẩu thành công");
                  form.resetFields();
                } catch (error) {
                  console.error("Error changing password:", error);
                  toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Form.Item
                label="Mật khẩu hiện tại"
                name="oldPassword"
                rules={[
                  {
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve(); // Hide error when empty
                      }
                      if (value.trim() === '') {
                        return Promise.reject(new Error('Mật khẩu không được chứa khoảng trắng'));
                      }
                      return Promise.resolve();
                    },
                  },
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  {
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve(); // Hide error when empty
                      }
                      if (value.trim() === '') {
                        return Promise.reject(new Error('Mật khẩu không được chứa khoảng trắng'));
                      }
                      if (value.length < 8) {
                        return Promise.reject(new Error('Mật khẩu phải từ 8 ký tự trở lên'));
                      }
                      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.[\]{}";,<>?/+_=\-]).*$/.test(value)) {
                        return Promise.reject(new Error('Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt'));
                      }
                      return Promise.resolve();
                    },
                  },
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu mới",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu mới",
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve(); // Hide error when empty
                      }
                      if (value.trim() === '') {
                        return Promise.reject(new Error('Mật khẩu không được chứa khoảng trắng'));
                      }
                      return Promise.resolve();
                    },
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="bg-[#008ECC]">
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
