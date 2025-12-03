/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import promotionApi from "../../api/promotion/PromotionApi";
import servicePackageApi from "../../api/seller/servicePackageApi";
import { ERROR_MESSAGES_VN } from "../../utils/constants";
import {
  Button,
  Card,
  Row,
  Col,
  Input,
  Modal,
  Form,
  Table,
  Space,
  Tooltip,
  Tag,
  DatePicker,
  Select,
  Alert,
  Statistic,
  message,
} from "antd";
import { toast } from "react-hot-toast";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export default function SellerPromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [packageLoading, setPackageLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    fetchPackageInfo();
    fetchPromotions();
  }, []);

  const fetchPackageInfo = async () => {
    setPackageLoading(true);
    try {
      const res = await servicePackageApi.getMyPackages();
      const packages = Array.isArray(res) ? res : [res].filter(Boolean);
      // Find package with packageId = 1 (discount code package)
      const discountPackage = packages.find((pkg) =>
        pkg.packageName?.includes("Gói Giảm Giá")
      );
      setPackageInfo(discountPackage || null);

      if (discountPackage) {
        const isActive = discountPackage.status === "Active";
        const hasUsage = discountPackage.remainingUsage > 0;
        const isNotExpired = discountPackage.endDate
          ? dayjs(discountPackage.endDate).isAfter(dayjs())
          : true;
        setCanCreate(isActive && hasUsage && isNotExpired);
      } else {
        setCanCreate(false);
      }
    } catch (error) {
      console.error("Error fetching package info:", error);
      setCanCreate(false);
    } finally {
      setPackageLoading(false);
    }
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionApi.getSellerPromotions(0, 100);
      const promotionsData = res.data.content || [];
      setPromotions(promotionsData.reverse());
    } catch (error) {
      console.error(error);
      // toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!canCreate) {
      toast.error(
        "Bạn không thể tạo mã giảm giá. Vui lòng kiểm tra gói dịch vụ của bạn."
      );
      return;
    }
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    if (!canCreate) {
      toast.error(
        "Bạn không thể chỉnh sửa mã giảm giá. Gói dịch vụ của bạn đã hết hạn hoặc hết lượt sử dụng."
      );
      return;
    }
    setEditingId(record.id);
    form.setFieldsValue({
      promotionCode: record.promotionCode,
      description: record.description,
      discountType: record.discountType,
      usageLimit: record.usageLimit,
      discountValue: record.discountValue,
      maxDiscountAmount: record.maxDiscountAmount,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      promotionStatus: record.promotionStatus,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        promotionCode: values.promotionCode,
        description: values.description,
        discountType: values.discountType,
        usageLimit: values.usageLimit,
        usedCount: 0,
        discountValue: parseFloat(values.discountValue),
        maxDiscountAmount: values.maxDiscountAmount
          ? parseFloat(values.maxDiscountAmount)
          : null,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        promotionStatus: values.promotionStatus,
      };

      if (editingId) {
        await promotionApi.updateSellerPromotion(editingId, payload);
        toast.success("Cập nhật mã giảm giá thành công!", 5);
      } else {
        await promotionApi.createSellerPromotion(payload);
        toast.success("Thêm mã giảm giá thành công!", 5);
        // Refresh package info after creating
        await fetchPackageInfo();
      }

      await fetchPromotions();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;

      if (errorCode === 2003) {
        form.setFields([
          {
            name: "promotionCode",
            errors: [ERROR_MESSAGES_VN[2003] || "Mã khuyến mãi đã tồn tại"],
          },
        ]);
      } else if (errorCode === 4007) {
        form.setFields([
          {
            name: "discountValue",
            errors: [
              ERROR_MESSAGES_VN[4007] ||
                "Phần trăm giảm giá không được vượt quá 100%",
            ],
          },
        ]);
      } else {
        let message = ERROR_MESSAGES_VN[errorCode] || "thất bại!";
        toast.error(message);
        await fetchPackageInfo();
      }
    }
  };

  const showDeleteModal = (record) => {
    if (!canCreate) {
      toast.error(
        "Bạn không thể xóa mã giảm giá. Gói dịch vụ của bạn đã hết hạn hoặc hết lượt sử dụng."
      );
      return;
    }
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await promotionApi.deleteSellerPromotion(deletingRecord.id);
      setPromotions((prev) => prev.filter((p) => p.id !== deletingRecord.id));
      toast.success("Đã xóa mã giảm giá!", 5);
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 8000 || errorCode === 8001 || errorCode === 8002) {
        toast.error(
          "Bạn không thể xóa mã giảm giá. Vui lòng kiểm tra gói dịch vụ của bạn.",
          5
        );
        await fetchPackageInfo();
      } else {
        console.error(error);
        toast.error("Không thể xóa mã giảm giá");
      }
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeletingRecord(null);
  };

  const filteredData = promotions.filter((item) =>
    item.promotionCode.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const columns = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "promotionCode",
      key: "promotionCode",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <Tag color={type === "PERCENT" ? "blue" : "purple"}>{type}</Tag>
      ),
    },
    {
      title: "Giá trị giảm",
      dataIndex: "discountValue",
      render: (val, record) =>
        record.discountType === "PERCENT"
          ? `${val}%`
          : `${val.toLocaleString()} ₫`,
    },
    {
      title: "Giảm tối đa",
      dataIndex: "maxDiscountAmount",
      render: (val) => (val ? `${val.toLocaleString()} ₫` : "Không có"),
    },
    {
      title: "Giới hạn",
      dataIndex: "usageLimit",
      render: (val) => val || "Không giới hạn",
    },
    { title: "Đã dùng", dataIndex: "usedCount" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "promotionStatus",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    // {
    //   title: "Thao tác",
    //   render: (_, record) => (
    //     <Space>
    //       <Tooltip title="Sửa">
    //         <Button
    //           type="text"
    //           icon={<EditOutlined />}
    //           onClick={() => handleEdit(record)}
    //           disabled={!canCreate}
    //         />
    //       </Tooltip>
    //       <Tooltip title="Xóa">
    //         <Button
    //           type="text"
    //           icon={<DeleteOutlined />}
    //           danger
    //           onClick={() => showDeleteModal(record)}
    //           disabled={!canCreate}
    //         />
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý mã khuyến mãi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          disabled={!canCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Thêm mã mới
        </Button>
      </div>

      {/* Package Info Card */}
      {packageInfo && (
        <Card
          className="mb-6"
          style={{ background: canCreate ? "#f6ffed" : "#fff2e8" }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Số lần còn lại"
                value={packageInfo.remainingUsage || 0}
                prefix={<GiftOutlined />}
                valueStyle={{ color: canCreate ? "#3f8600" : "#cf1322" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Trạng thái gói"
                value={
                  packageInfo.status === "Active"
                    ? "Đang hoạt động"
                    : "Đã hết hạn"
                }
                valueStyle={{ color: canCreate ? "#3f8600" : "#cf1322" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Ngày hết hạn"
                value={
                  packageInfo.endDate
                    ? dayjs(packageInfo.endDate).format("DD/MM/YYYY")
                    : "N/A"
                }
              />
            </Col>
          </Row>
          {!canCreate && (
            <Alert
              message="Bạn không thể tạo mã giảm giá"
              description={
                packageInfo.status !== "Active"
                  ? "Gói dịch vụ của bạn đã hết hạn. Vui lòng mua gói mới để tiếp tục sử dụng."
                  : packageInfo.remainingUsage <= 0
                  ? "Bạn đã sử dụng hết số lần tạo mã giảm giá. Vui lòng mua gói mới để tiếp tục sử dụng."
                  : "Gói dịch vụ của bạn không hợp lệ."
              }
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      )}

      {!packageInfo && !packageLoading && (
        <Alert
          message="Bạn chưa mua gói dịch vụ tạo mã giảm giá"
          description="Vui lòng mua gói dịch vụ để có thể tạo mã giảm giá cho shop của bạn."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button
              type="primary"
              onClick={() =>
                (window.location.href = "/seller/service-packages")
              }
            >
              Mua gói ngay
            </Button>
          }
        />
      )}

      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo mã..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              size="large"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Tất cả
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} mã`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Chỉnh sửa mã khuyến mãi" : "Thêm mã khuyến mãi"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã khuyến mãi"
            name="promotionCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã khuyến mãi" },
              {
                whitespace: true,
                message: "Mã khuyến mãi không thể chỉ chứa khoảng trắng",
              },
              {
                validator: (_, value) => {
                  if (
                    value &&
                    (value.trim().length < 3 || value.trim().length > 100)
                  ) {
                    return Promise.reject(
                      new Error("Mã khuyến mãi phải có từ 3 đến 100 ký tự")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="VD: MA_GIAM_20" />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              {
                whitespace: true,
                message: "Mô tả không thể chỉ chứa khoảng trắng",
              },
              {
                validator: (_, value) => {
                  if (
                    value &&
                    (value.trim().length < 10 || value.trim().length > 500)
                  ) {
                    return Promise.reject(
                      new Error("Mô tả phải có từ 10 đến 500 ký tự")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="VD: Giảm 20% đơn hàng" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "PERCENT", label: "Phần trăm (%)" },
                    { value: "AMOUNT", label: "Theo số tiền (₫)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá trị giảm"
                name="discountValue"
                rules={[
                  { required: true, message: "Nhập giá trị giảm" },
                  {
                    type: "number",
                    min: 1,
                    message: "Giá trị giảm phải là một số dương",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giảm tối đa"
                name="maxDiscountAmount"
                rules={[
                  {
                    type: "number",
                    min: 1,
                    max: 2000000000,
                    message: "Giảm tối đa phải là số dương và nhỏ hơn 2 tỉ",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Không giới hạn nếu để trống"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giới hạn sử dụng"
                name="usageLimit"
                rules={[
                  { required: true, message: "Nhập giới hạn sử dụng" },
                  {
                    type: "number",
                    min: 1,
                    message: "Giới hạn sử dụng phải là một số dương",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" placeholder="VD: 30" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  {
                    validator: (_, value) => {
                      if (value && value.isBefore(dayjs().startOf("day"))) {
                        return Promise.reject(
                          new Error(
                            ERROR_MESSAGES_VN[4005] ||
                              "Ngày bắt đầu phải sau ngày hiện tại"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                dependencies={["startDate"]}
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue("startDate")) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(getFieldValue("startDate"))) {
                        return Promise.reject(
                          new Error(
                            ERROR_MESSAGES_VN[4004] ||
                              "Ngày kết thúc phải sau ngày bắt đầu"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Trạng thái"
            name="promotionStatus"
            rules={[{ required: true }]}
          >
            <Select options={[{ value: "Active", label: "Hoạt động" }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {deletingRecord && (
          <p>
            Bạn có chắc chắn muốn xóa mã "{deletingRecord.promotionCode}" không?
          </p>
        )}
      </Modal>
    </div>
  );
}
