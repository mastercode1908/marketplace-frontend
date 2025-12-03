/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Avatar,
  Upload,
  Tabs,
  Statistic,
  Modal,
} from "antd";
import { toast } from "react-hot-toast";
import { CameraOutlined, ShopOutlined, UserOutlined, StarFilled } from "@ant-design/icons";
import sellerProfileApi from "../../api/identity/SellerProfileApi";
import mediaApi from "../../api/identity/mediaApi";
import sellerDashboardApi from "../../api/seller/sellerDashboardApi";

export default function SellerProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [data, kpi] = await Promise.all([
        sellerProfileApi.getProfile(),
        sellerDashboardApi.getKPI().catch(() => null)
      ]);

      if (!data || !data.user || !data.seller) {
        toast.error("Không tìm thấy thông tin seller");
        return;
      }

      const displayAvatar = avatarPreview || data.user.avatar;

      setSellerData({
        user: { ...data.user, avatar: displayAvatar },
        seller: data.seller,
      });
      setKpiData(kpi);

      setOriginalAvatar(data.user.avatar);
      form.setFieldsValue({
        ...data.user,
        ...data.seller,
        rating_count: kpi?.averageRating ? kpi.averageRating.toFixed(1) : "0.0"
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Lấy thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;

    try {
      // 1. Preview ngay lập tức
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);

      // 2. Upload lên cloud
      const formData = new FormData();
      formData.append("file", file);
      const res = await mediaApi.uploadSingle(formData);
      const serverUrl =
        res?.url || res?.data?.url || res?.result?.url || res?.data;

      if (!serverUrl || typeof serverUrl !== "string") {
        throw new Error("Không nhận được URL ảnh");
      }

      // Chỉ lưu URL vào state, KHÔNG gọi API updateProfile
      setAvatarPreview(serverUrl);
      toast.success("Tải ảnh thành công! Hãy bấm Lưu để cập nhật.");

    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err.response?.data?.message || "Đổi ảnh thất bại. Vui lòng thử lại!"
      );
      setAvatarPreview(null);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAvatarPreview(null);
    setIsEditing(false);
    fetchProfile();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const allValues = { ...form.getFieldsValue(true), ...values };

      if (!allValues.full_name?.trim()) return toast.error("Họ tên không được để trống");
      if (!allValues.shop_name?.trim()) return toast.error("Tên cửa hàng không được để trống");
      if (!allValues.shop_address?.trim()) return toast.error("Địa chỉ cửa hàng không được để trống");
      if (allValues.phone && !/^\d{9,12}$/.test(allValues.phone))
        return toast.error("Số điện thoại phải có 9-12 chữ số");

      const genderValue =
        allValues.gender === "Male" ? true : allValues.gender === "Female" ? false : null;

      // Sử dụng avatar mới nếu có (avatarPreview chứa URL từ cloud), nếu không dùng avatar cũ
      const newAvatar = avatarPreview && avatarPreview.startsWith("http") ? avatarPreview : sellerData.user.avatar;

      const payload = {
        avatar: newAvatar,
        full_name: allValues.full_name.trim(),
        gender: genderValue,
        phone: allValues.phone?.trim() || null,
        shop_name: allValues.shop_name.trim(),
        shop_address: allValues.shop_address.trim(),
        shop_description: allValues.shop_description?.trim() || null,
      };

      await sellerProfileApi.updateProfile(payload);

      // Cập nhật state local
      setSellerData(prev => ({
        ...prev,
        user: { ...prev.user, avatar: newAvatar, full_name: payload.full_name },
        seller: { ...prev.seller, shop_name: payload.shop_name }
      }));
      setOriginalAvatar(newAvatar);
      setAvatarPreview(null); // Reset preview vì đã lưu thành công

      // Cập nhật localStorage và dispatch event
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const update = (obj) => {
        if (obj) {
          obj.avatar = newAvatar;
          obj.avatarUrl = newAvatar;
          obj.fullName = payload.full_name;
          obj.full_name = payload.full_name;
        }
      };
      [currentUser.data?.user, currentUser.user, currentUser].forEach(update);
      localStorage.setItem("user", JSON.stringify(currentUser));
      window.dispatchEvent(new Event("storage"));

      Modal.success({
        title: "Thành công",
        content: "Cập nhật thông tin hồ sơ thành công!",
        okText: "Đóng",
        onOk: () => fetchProfile(),
      });

      toast.success("Cập nhật hồ sơ thành công");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!sellerData) return <p className="text-center py-10">Đang tải...</p>;

  const userContent = (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item label="Tên Đăng Nhập" name="username">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Email" name="email">
            <Input type="email" disabled />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item label="Họ Tên" name="full_name">
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Giới Tính" name="gender">
            <Select
              placeholder="Chọn giới tính"
              options={[
                { label: "Nam", value: "Male" },
                { label: "Nữ", value: "Female" },
                { label: "Khác", value: "Other" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item label="Số Điện Thoại" name="phone">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const shopContent = (
    <div>
      <Form.Item label="Tên Cửa Hàng" name="shop_name">
        <Input placeholder="Nhập tên cửa hàng" disabled={!isEditing} />
      </Form.Item>
      <Form.Item label="Địa Chỉ Cửa Hàng" name="shop_address">
        <Input.TextArea rows={3} placeholder="Nhập địa chỉ cửa hàng" disabled={!isEditing} />
      </Form.Item>
      <Form.Item label="Mô Tả Cửa Hàng" name="shop_description">
        <Input.TextArea rows={4} placeholder="Nhập mô tả cửa hàng" disabled={!isEditing} />
      </Form.Item>
      <Form.Item label="Mã Số Thuế" name="taxCode">
        <Input disabled />
      </Form.Item>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item label="Đánh Giá" name="rating_count">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card className="mb-6 shadow-lg">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} className="text-center">
            <div className="relative inline-block">
              <Avatar
                size={120}
                src={avatarPreview || sellerData.user.avatar}
                icon={<UserOutlined />}
              />
              {isEditing && (
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleUploadAvatar}
                  className="absolute bottom-0 right-0"
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="large"
                    className="shadow-md"
                  />
                </Upload>
              )}
            </div>
          </Col>
          <Col xs={24} sm={18}>
            <h1 className="text-3xl font-bold mb-2">{sellerData.user.full_name}</h1>
            <p className="text-gray-600">@{sellerData.user.username}</p>
            <p className="text-gray-500 text-sm mb-4">
              Cửa hàng: {sellerData.seller.shop_name}
            </p>
            <div className="flex gap-8">
              <Statistic
                title="Đánh Giá"
                value={kpiData?.averageRating || 0}
                precision={1}
                suffix={
                  <span style={{ fontSize: '24px' }}>
                    / 5 <StarFilled style={{ color: "#fadb14" }} />
                  </span>
                }
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-lg">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Hồ Sơ Của Tôi</h2>
          {!isEditing ? (
            <Button type="primary" size="large" onClick={() => setIsEditing(true)}>
              Chỉnh Sửa Hồ Sơ
            </Button>
          ) : (
            <div className="space-x-3">
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" form="seller-form" loading={loading}>
                Lưu Thay Đổi
              </Button>
            </div>
          )}
        </div>

        <Form
          id="seller-form"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={!isEditing}
        >
          <Tabs
            items={[
              {
                key: "user",
                label: <span><UserOutlined /> Thông Tin Cá Nhân</span>,
                children: userContent,
              },
              {
                key: "shop",
                label: <span><ShopOutlined /> Thông Tin Cửa Hàng</span>,
                children: shopContent,
              },
            ]}
          />
        </Form>
      </Card>
    </div>
  );
}