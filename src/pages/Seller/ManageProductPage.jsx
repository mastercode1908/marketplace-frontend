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
import productApi from "@/api/identity/productApi";
import { useNavigate } from "react-router-dom";
import "../../styles/SellerLayout.css";

const { Option } = Select;

export default function ManageProductSellerPage() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const navigate = useNavigate();

  const categoryMap = {
    1: "Điện thoại",
    2: "Laptop",
    3: "Phụ kiện",
    4: "Quần áo",
    5: "Giày dép",
    6: "Đồng hồ",
    7: "Mỹ phẩm",
    8: "Đồ gia dụng",
    9: "Thể thao",
    10: "Sách",
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productApi.getBySeller();

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];

        setProduct(
          data.map((s) => ({
            productId: s.productId,
            url: s.media?.[0]?.url || "", // lấy ảnh đầu tiên
            categoryId: s.categoryId,
            name: s.name,
            price: s.price,
            stockQuantity: s.stockQuantity,
            productStatus: s.productStatus,
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  const handleAdd = () => {
    navigate("/seller/product-seller");
  };

  const handleEdit = (record) => {
    navigate(`/seller/product-seller/${record.productId}`);
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await productApi.deleteProduct(deletingRecord.productId);

      setProduct((prev) =>
        prev.filter((item) => item.productId !== deletingRecord.productId)
      );

      // message.success("Đã xóa sản phẩm!");
      toast.success("Đã xóa sản phẩm!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa sản phẩm!");
      // message.error("Không thể xóa sản phẩm!");
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeletingRecord(null);
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory(null);
    setSelectedStatus(null);
  };

  const filteredData = product.filter((item) => {
    const nameMatch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase().trim());
    const categoryName = categoryMap[item.categoryId];
    const categoryMatch = categoryName
      ?.toLowerCase()
      .includes(searchText.toLowerCase().trim());

    const categoryFilter = selectedCategory
      ? item.categoryId === selectedCategory
      : true;
    const statusFilter = selectedStatus
      ? item.productStatus === selectedStatus
      : true;

    return (nameMatch || categoryMatch) && categoryFilter && statusFilter;
  });

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "url",
      key: "url",
      render: (url) => (
        <img
          src={url || "/no-image.png"}
          alt="product"
          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (id) => categoryMap[id] || "Không rõ",
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (val) => val.toLocaleString("vi-VN"),
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
    },
    {
      title: "Trạng thái",
      dataIndex: "productStatus",
      key: "productStatus",
      render: (status) => {
        let color = "default";
        let text = "Không rõ";

        switch (status) {
          case "Approved":
          case "ACTIVE":
            color = "green";
            text = "Đang bán";
            break;
          case "Pending":
            color = "orange";
            text = "Chờ duyệt";
            break;
          case "Rejected":
            color = "red";
            text = "Từ chối";
            break;
          case "Inactive":
          case "INACTIVE":
            color = "gray";
            text = "Ngừng bán";
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ... (keep columns definition) ...

  return (
    <div className="seller-content">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <Button
          type="primary"
          onClick={handleAdd}
          size="large"
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <PlusOutlined style={{ fontSize: "15px", lineHeight: 0 }} />
          Thêm sản phẩm
        </Button>
      </div>

      <Card
        className="mb-6"
        style={{ border: "1px solid white", boxShadow: "none" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
          <Col>
            <Select
              placeholder="Danh mục"
              style={{ width: 150 }}
              size="large"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {Object.entries(categoryMap).map(([id, name]) => (
                <Option key={id} value={Number(id)}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              size="large"
              allowClear
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="Approved">Đang bán</Option>
              <Option value="Pending">Chờ duyệt</Option>
              <Option value="Rejected">Từ chối</Option>
              <Option value="Inactive">Ngừng bán</Option>
            </Select>
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              size="large"
              onClick={handleResetFilters}
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

      <Card style={{ border: "1px solid white", boxShadow: "none" }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="productId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalVisible}
        // onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              { whitespace: true, message: "Tên không hợp lệ" },
              {
                validator: (_, value) => {
                  if (
                    value &&
                    (value.trim().length < 3 || value.trim().length > 100)
                  ) {
                    return Promise.reject(new Error("Tên phải từ 3–100 ký tự"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên sản phẩm" size="large" />
          </Form.Item>

          <Form.Item
            label="Danh mục (CategoryId)"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng nhập categoryId" }]}
          >
            <Input type="number" placeholder="Nhập categoryId" size="large" />
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              {
                type: "number",
                min: 1,
                transform: (value) => Number(value),
                message: "Giá phải lớn hơn 0",
              },
            ]}
          >
            <Input type="number" placeholder="Nhập giá" size="large" />
          </Form.Item>

          <Form.Item
            label="Số lượng tồn kho"
            name="stockQuantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn" },
              {
                type: "number",
                min: 0,
                transform: (value) => Number(value),
                message: "Tồn kho không được âm",
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số lượng tồn" size="large" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="productStatus"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select size="large">
              <Select.Option value="ACTIVE">Đang bán</Select.Option>
              <Select.Option value="INACTIVE">Ngừng bán</Select.Option>
            </Select>
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
            Bạn có chắc chắn muốn xóa sản phẩm "{deletingRecord.name}" không?
          </p>
        )}
      </Modal>
    </div>
  );
}
