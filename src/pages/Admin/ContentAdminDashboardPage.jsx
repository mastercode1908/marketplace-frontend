/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Card,
  message,
  Image,
  Modal,
  Tooltip,
  Tabs,
  Form,
  Select,
  Input,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import contentAdminApi from "../../api/admin/contentAdminApi";
import "../../styles/AdminDashboard.css"; // Reuse admin styles

const { Title, Text } = Typography;

export default function ContentAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  const [activeTab, setActiveTab] = useState("PENDING");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const status = activeTab === "ALL" ? null : activeTab;
      const data = await contentAdminApi.getProducts(status);
      // Normalize data if needed (handle array or object with content)
      const list = Array.isArray(data) ? data : data?.content || [];
      setProducts(list);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const showApproveModal = (product) => {
    console.log("Show approve modal for:", product);
    setSelectedProduct(product);
    setApproveModalVisible(true);
  };

  const showRejectModal = (product) => {
    console.log("Show reject modal for:", product);
    setSelectedProduct(product);
    setRejectModalVisible(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedProduct) return;
    const id = selectedProduct.productId || selectedProduct.id;
    console.log("Approving product ID:", id);

    setActionLoading(id);
    setApproveModalVisible(false); // Close modal immediately or wait? Better wait if we want to show loading in modal.
    // But here we show loading on the button in table?
    // Let's close modal and show loading on table button as before.

    try {
      await contentAdminApi.updateProductStatus(
        id,
        "Approved"
      );
      message.success("Đã duyệt sản phẩm thành công");
      setProducts((prev) =>
        prev.filter((p) => (p.productId || p.id) !== id)
      );
      fetchProducts();
    } catch (error) {
      console.error("Error approving product:", error);
      message.error("Duyệt sản phẩm thất bại");
    } finally {
      setActionLoading(null);
      setSelectedProduct(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedProduct) return;
    const id = selectedProduct.productId || selectedProduct.id;
    console.log("Rejecting product ID:", id);

    setActionLoading(id);
    setRejectModalVisible(false);

    try {
      await contentAdminApi.updateProductStatus(
        id,
        "Rejected"
      );
      message.success("Đã từ chối sản phẩm");
      setProducts((prev) =>
        prev.filter((p) => (p.productId || p.id) !== id)
      );
      fetchProducts();
    } catch (error) {
      console.error("Error rejecting product:", error);
      message.error("Từ chối sản phẩm thất bại");
    } finally {
      setActionLoading(null);
      setSelectedProduct(null);
    }
  };

  const showStatusModal = (product) => {
    setSelectedProduct(product);
    // If in Approved or Rejected tab, clear the value to show placeholder
    // because the current status is not in the available options.
    if (activeTab === "Approved" || activeTab === "Rejected") {
      form.setFieldsValue({ status: null });
    } else {
      form.setFieldsValue({ status: product.productStatus || product.status });
    }
    setIsStatusModalVisible(true);
  };

  const handleStatusModalOk = async () => {
    try {
      const values = await form.validateFields();
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedProduct(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 250, // Reduced width
      render: (text, record) => (
        <Space>
          <Image
            width={40} // Smaller image
            height={40}
            src={record.media?.[0]?.url || "https://via.placeholder.com/50"}
            fallback="https://via.placeholder.com/50"
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: 13 }}>{text}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (_, category) => category?.categoryName || "N/A",
    },
    {
      title: "Người bán",
      dataIndex: "seller",
      key: "seller",
      width: 180,
      render: (_, seller) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>{seller?.shopName || seller?.shop_name || "N/A"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {seller?.email || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 180, // Adjusted width
      render: (_, record) => (
        <Space size="small">
          {activeTab === "PENDING" ? (
            <>
              <Button
                type="primary"
                size="small" // Smaller button
                style={{ background: "#52c41a", borderColor: "#52c41a", fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                icon={<CheckCircleOutlined />}
                loading={actionLoading === (record.productId || record.id)}
                onClick={() => showApproveModal(record)}
              >
                Duyệt
              </Button>
              <Button
                danger
                type="primary"
                size="small" // Smaller button
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                icon={<CloseCircleOutlined />}
                loading={actionLoading === (record.productId || record.id)}
                onClick={() => showRejectModal(record)}
              >
                Từ chối
              </Button>
            </>
          ) : (
            <Tooltip title="Cập nhật trạng thái">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showStatusModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="content-admin-dashboard" style={{ padding: 24 }}>
      <div className="dashboard-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Duyệt sản phẩm
          </Title>
          <Text type="secondary">
            Danh sách các sản phẩm đang chờ phê duyệt
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchProducts}
          loading={loading}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Làm mới
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "ALL", label: "Tất Cả" },
          { key: "PENDING", label: "Chờ Duyệt" },
          { key: "Approved", label: "Đã Duyệt" },
          { key: "Rejected", label: "Từ Chối" },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Card className="chart-card" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={products}
          rowKey={(record) => record.productId || record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }} // Fix overflow issue
          locale={{ emptyText: "Không có sản phẩm nào chờ duyệt" }}
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        title="Xác nhận duyệt sản phẩm"
        open={approveModalVisible}
        onOk={handleConfirmApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Duyệt"
        cancelText="Hủy"
        okButtonProps={{ style: { background: "#52c41a", borderColor: "#52c41a" } }}
      >
        <p>Bạn có chắc chắn muốn duyệt sản phẩm "<strong>{selectedProduct?.name}</strong>"?</p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối sản phẩm"
        open={rejectModalVisible}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn từ chối sản phẩm "<strong>{selectedProduct?.name}</strong>"?</p>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái"
        open={isStatusModalVisible}
        onOk={handleStatusModalOk}
        onCancel={handleStatusModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={!!actionLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              placeholder="Hãy chọn trạng thái"
              options={
                activeTab === "Approved"
                  ? [{ label: "Từ chối", value: "Rejected" }]
                  : activeTab === "Rejected"
                    ? [{ label: "Đã duyệt", value: "Approved" }]
                    : [
                      { label: "Đã duyệt", value: "Approved" },
                      { label: "Từ chối", value: "Rejected" },
                    ]
              }
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
          >
            {({ getFieldValue }) =>
              getFieldValue("status") === "Rejected" ? (
                <Form.Item
                  label="Lý do từ chối"
                  name="note"
                  rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
                >
                  <Input.TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
