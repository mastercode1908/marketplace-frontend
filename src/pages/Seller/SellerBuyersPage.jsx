import { useState, useEffect } from "react";
import { Table, Tag, Button, Input, Space, Modal, Spin, Card } from "antd";
import { toast } from "react-hot-toast";
import { SearchOutlined, EyeOutlined, SyncOutlined, CarOutlined } from "@ant-design/icons";
import sellerApi from "../../api/seller/sellerApi";
import "../../styles/SellerLayout.css";

const { Search } = Input;

export default function SellerBuyersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await sellerApi.getSellerOrders();
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const trimmedValue = value ? value.trim() : "";
    if (!trimmedValue) {
      setFilteredOrders(orders);
      return;
    }
    const filtered = orders.filter(
      (order) =>
        order.id?.toString().includes(trimmedValue) ||
        order.buyer?.user?.fullName?.toLowerCase().includes(trimmedValue.toLowerCase()) ||
        order.buyer?.user?.email?.toLowerCase().includes(trimmedValue.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleViewDetail = async (orderId) => {
    try {
      const order = await sellerApi.getOrderById(orderId);
      setSelectedOrder(order);
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleSyncGHN = async (orderId) => {
    try {
      await sellerApi.syncOrderStatus(orderId);
      toast.success("Đồng bộ trạng thái đơn hàng thành công!");
      Modal.success({
        title: "Thành công",
        content: "Đồng bộ trạng thái đơn hàng từ GHN thành công!",
        okText: "Đóng",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error syncing order:", error);
      toast.error("Không thể đồng bộ trạng thái đơn hàng");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      Pending: "orange",
      Processing: "blue",
      Shipped: "cyan",
      Delivered: "green",
      Cancelled: "red",
    };
    return statusMap[status] || "default";
  };

  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Người Mua",
      key: "buyer",
      render: (_, record) => {
        const buyer = record.buyer?.user || record.buyer;
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{buyer?.fullName || "N/A"}</div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              {buyer?.email || ""}
            </div>
          </div>
        );
      },
    },
    {
      title: "Số Điện Thoại",
      key: "phone",
      render: (_, record) => {
        const buyer = record.buyer?.user || record.buyer;
        return buyer?.phone || "-";
      },
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <span style={{ fontWeight: 600, color: "#008ECC" }}>
          {formatPrice(amount || 0)}
        </span>
      ),
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Pending"}</Tag>
      ),
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Processing", value: "Processing" },
        { text: "Shipped", value: "Shipped" },
        { text: "Delivered", value: "Delivered" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => record.orderStatus === value,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<SyncOutlined />}
            onClick={() => handleSyncGHN(record.id)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Đồng Bộ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="seller-content">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="seller-page-title">Quản Lý Người Mua</h1>
        <p className="seller-page-description">
          Xem và quản lý tất cả đơn hàng từ người mua
        </p>
      </div>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Tìm kiếm theo mã đơn, tên, email..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                setFilteredOrders(orders);
              }
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          locale={{ emptyText: "Chưa có đơn hàng nào" }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title="Chi Tiết Đơn Hàng"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <strong>Mã Đơn:</strong> {selectedOrder.id}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <strong>Trạng Thái:</strong>{" "}
              <Tag color={getStatusColor(selectedOrder.orderStatus)}>
                {selectedOrder.orderStatus}
              </Tag>
            </div>
            {selectedOrder.shippingStatus && (
              <div style={{ marginBottom: "16px" }}>
                <strong>
                  <CarOutlined /> Trạng thái vận chuyển:
                </strong>{" "}
                <Tag color="blue">{selectedOrder.shippingStatus}</Tag>
              </div>
            )}
            <div style={{ marginBottom: "16px" }}>
              <strong>Tổng Tiền:</strong>{" "}
              <span style={{ color: "#008ECC", fontWeight: 600 }}>
                {formatPrice(selectedOrder.totalAmount || 0)}
              </span>
            </div>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <strong>Sản Phẩm:</strong>
                <Table
                  dataSource={selectedOrder.items}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: "Sản Phẩm",
                      dataIndex: "productName",
                      key: "productName",
                    },
                    {
                      title: "Số Lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                    },
                    {
                      title: "Giá",
                      dataIndex: "price",
                      key: "price",
                      render: (price) => formatPrice(price),
                    },
                    {
                      title: "Thành Tiền",
                      key: "subtotal",
                      render: (_, record) =>
                        formatPrice((record.price || 0) * (record.quantity || 0)),
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}



