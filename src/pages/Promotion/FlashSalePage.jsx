/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
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
import { PlusOutlined, SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import flashSaleApi from "../../api/promotion/FlashSaleApi";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function FlashSalePage() {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await flashSaleApi.getAll();
        const flashSalesData = res.data.content || res.data || [];
        setFlashSales(flashSalesData.reverse());
      } catch (err) {
        toast.error("Không thể tải danh sách flash sale");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      dateRange: [dayjs(record.start_date), dayjs(record.end_date)],
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        admin_id: 1,
        name: values.name,
        start_date: dayjs(values.dateRange[0]).format("YYYY-MM-DD HH:mm:ss"),
        end_date: dayjs(values.dateRange[1]).format("YYYY-MM-DD HH:mm:ss"),
      };

      if (editingId) {
        await flashSaleApi.update(editingId, payload);
        toast.success("Cập nhật flash sale thành công!");
      } else {
        await flashSaleApi.create(payload);
        toast.success("Tạo flash sale thành công!");
      }

      const res = await flashSaleApi.getAll();
      const flashSalesData = res.data.content || res.data || [];
      setFlashSales(flashSalesData.reverse());
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      toast.error("Không thể lưu flash sale");
    }
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await flashSaleApi.delete(deletingRecord.id);
      setFlashSales((prev) => prev.filter((item) => item.id !== deletingRecord.id));
      toast.success("Đã xóa flash sale!");
    } catch (err) {
      toast.error("Không thể xóa flash sale");
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeletingRecord(null);
  };

  const filteredData = flashSales.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchText.toLowerCase().trim());

    if (statusFilter === "all") return matchesSearch;

    const now = dayjs();
    const start = dayjs(item.start_date);
    const end = dayjs(item.end_date);

    let status = "upcoming";
    if (now.isAfter(start) && now.isBefore(end)) {
      status = "ongoing";
    } else if (now.isAfter(end)) {
      status = "ended";
    }

    return matchesSearch && status === statusFilter;
  });

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Tên Flash Sale", dataIndex: "name", key: "name" },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày Kết Thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng Thái",
      key: "status",
      render: (_, record) => {
        const now = dayjs();
        const start = dayjs(record.start_date);
        const end = dayjs(record.end_date);
        let color = "blue";
        let text = "Sắp diễn ra";
        if (now.isAfter(start) && now.isBefore(end)) {
          color = "green";
          text = "Đang diễn ra";
        } else if (now.isAfter(end)) {
          color = "red";
          text = "Đã kết thúc";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao Tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" icon={<DeleteOutlined />} danger onClick={() => showDeleteModal(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Flash Sale</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          Thêm Flash Sale
        </Button>
      </div>

      <Card className="mb-6">
        <Row gutter={16}>
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên..."
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
                { value: "upcoming", label: "Sắp diễn ra" },
                { value: "ongoing", label: "Đang diễn ra" },
                { value: "ended", label: "Đã kết thúc" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} mục`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Chỉnh sửa Flash Sale" : "Thêm Flash Sale"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="Tên Flash Sale" name="name" rules={[{ required: true, message: "Nhập tên flash sale" }]}>
            <Input placeholder="VD: Săn sale tháng 11" size="large" />
          </Form.Item>
          <Form.Item
            label="Thời gian diễn ra"
            name="dateRange"
            rules={[{ required: true, message: "Chọn thời gian bắt đầu và kết thúc" }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
              size="large"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
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
        {deletingRecord && <p>Bạn có chắc chắn muốn xóa flash sale "{deletingRecord.name}" không?</p>}
      </Modal>
    </div>
  );
}
