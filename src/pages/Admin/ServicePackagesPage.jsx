/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import servicePackageApi from "../../api/promotion/servicePackageApi";
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

const { Option } = Select;

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicePackageApi.getAll();
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        setServices(
          data.reverse().map((s) => ({
            id: s.id,
            name: s.name,
            type: s.type,
            description: s.description,
            price: s.price,
            durationDays: s.durationDays,
            usageLimit: s.usageLimit,
            status: s.deletedAt ? "Ngừng hoạt động" : "Hoạt động",
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách dịch vụ");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      description: record.description,
      price: record.price,
      durationDays: record.durationDays,
      usageLimit: record.usageLimit,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        type: values.type,
        description: values.description,
        price: parseFloat(values.price),
        durationDays: parseInt(values.durationDays),
        usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
      };

      if (editingId) {
        await servicePackageApi.update(editingId, payload);
        toast.success("Cập nhật gói dịch vụ thành công!");
      } else {
        await servicePackageApi.create(payload);
        toast.success("Thêm gói dịch vụ thành công!");
      }

      const res = await servicePackageApi.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setServices(
        data.reverse().map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          description: s.description,
          price: s.price,
          durationDays: s.durationDays,
          usageLimit: s.usageLimit,
          status: s.deletedAt ? "Ngừng hoạt động" : "Hoạt động",
        }))
      );

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu dịch vụ");
    }
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await servicePackageApi.delete(deletingRecord.id);
      setServices((prev) =>
        prev.filter((item) => item.id !== deletingRecord.id)
      );
      toast.success("Đã xóa gói dịch vụ!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa gói dịch vụ!");
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeletingRecord(null);
  };

  const filteredData = services.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase().trim());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" ? item.status === "Hoạt động" : item.status === "Ngừng hoạt động");
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      render: (text) => <span className="font-bold">{text}</span>,
    },
    { title: "Tên gói", dataIndex: "name" },
    {
      title: "Loại gói",
      dataIndex: "type",
      render: (t) => (
        <Tag color={t === "Reputation" ? "green" : "blue"}>{t}</Tag>
      ),
    },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      render: (price) => price.toLocaleString(),
    },
    { title: "Thời lượng (ngày)", dataIndex: "durationDays" },
    {
      title: "Giới hạn sử dụng",
      dataIndex: "usageLimit",
      render: (u) => (u === null ? "Không giới hạn" : u),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Hoạt động" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
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
        <h1 className="text-3xl font-bold text-gray-800">
          Quản lý gói dịch vụ
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Thêm gói
        </Button>
      </div>

      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên gói..."
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
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Ngừng hoạt động" },
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
            showTotal: (total) => `Tổng ${total} gói`,
          }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingId ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Tên gói"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên gói" },
              {
                whitespace: true,
                message: "Tên gói không thể chỉ chứa khoảng trắng",
              },
              {
                validator: (_, value) => {
                  if (
                    value &&
                    (value.trim().length < 3 || value.trim().length > 100)
                  ) {
                    return Promise.reject(
                      new Error("Tên gói phải có từ 3 đến 100 ký tự")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên gói" size="large" />
          </Form.Item>
          <Form.Item
            label="Loại gói"
            name="type"
            rules={[
              { required: true, message: "Vui lòng nhập loại gói" },
              {
                whitespace: true,
                message: "Loại gói không thể chỉ chứa khoảng trắng",
              },
            ]}
          >
            <Input placeholder="Nhập loại gói" size="large" />
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
            <Input.TextArea placeholder="Nhập mô tả" rows={3} size="large" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  {
                    type: "number",
                    min: 1,
                    message: "Giá phải là một số dương",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" placeholder="Nhập giá" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời lượng (ngày)"
                name="durationDays"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                  {
                    type: "integer",
                    min: 1,
                    message: "Thời lượng phải là một số nguyên dương",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" placeholder="Nhập số ngày" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Giới hạn sử dụng"
            name="usageLimit"
            rules={[
              {
                validator: (_, value) => {
                  if (value === undefined || value === "") {
                    return Promise.resolve();
                  }
                  const num = Number(value);
                  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
                    return Promise.reject(
                      new Error("Giới hạn sử dụng phải là một số nguyên dương")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Nhập số lượng (bỏ trống nếu không giới hạn)"
              size="large"
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
          <p>Bạn có chắc chắn muốn xóa gói "{deletingRecord.name}" không?</p>
        )}
      </Modal>
    </div>
  );
}
