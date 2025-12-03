/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import promotionApi from "../../api/promotion/PromotionApi";
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
} from "antd";
import { toast } from "react-hot-toast";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await promotionApi.getAll();
        const promotionsData = res.data.content || [];
        setPromotions(promotionsData.reverse());
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách mã giảm giá");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
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
        await promotionApi.update(editingId, payload);
        toast.success("Cập nhật mã giảm giá thành công!", 5);
      } else {
        await promotionApi.create(payload);
        toast.success("Thêm mã giảm giá thành công!", 5);
      }

      const res = await promotionApi.getAll();
      const promotionsData = res.data.content || [];
      setPromotions(promotionsData.reverse());
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 2003) {
        form.setFields([
          {
            name: "promotionCode",
            errors: [ERROR_MESSAGES_VN[2003]],
          },
        ]);
      } else if (errorCode === 4007) {
        form.setFields([
          {
            name: "discountValue",
            errors: [ERROR_MESSAGES_VN[4007]],
          },
        ]);
      } else if (errorCode === 1000) {
        toast.error(ERROR_MESSAGES_VN[1000], 5);
      } else {
        console.error(error);
        toast.error("Không thể lưu mã giảm giá");
      }
    }
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await promotionApi.delete(deletingRecord.id);
      setPromotions((prev) => prev.filter((p) => p.id !== deletingRecord.id));
      toast.success("Đã xóa mã giảm giá!", 5);
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa mã giảm giá");
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeletingRecord(null);
  };

  const filteredData = promotions.filter((item) => {
    const matchesSearch = item.promotionCode.toLowerCase().includes(searchText.toLowerCase().trim());
    const matchesStatus = statusFilter === "all" || item.promotionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => showDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
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
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Thêm mã mới
        </Button>
      </div>

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
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              size="large"
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "Active", label: "Hoạt động" },
                { value: "Inactive", label: "Không hoạt động" },
              ]}
            />
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
              <Form.Item label="Giảm tối đa" name="maxDiscountAmount">
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
                          new Error(ERROR_MESSAGES_VN[4005])
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
                          new Error(ERROR_MESSAGES_VN[4004])
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
            <Select
              options={[
                { value: "Active", label: "Hoạt động" },
                { value: "Inactive", label: "Không hoạt động" },
              ]}
            />
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
