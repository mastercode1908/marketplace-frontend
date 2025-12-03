import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Table,
  Tag,
  Button,
  Progress,
  Segmented,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  ProductOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import sellerApi from "../../api/seller/sellerApi";
import sellerDashboardApi from "../../api/seller/sellerDashboardApi";
import { toast } from "react-hot-toast";
import "../../styles/SellerLayout.css";

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState(null);
  const [orderGrowthData, setOrderGrowthData] = useState(null);
  const [reviewStatsData, setReviewStatsData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  // Initial load - fetch all data except chart
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch chart data when period changes
  useEffect(() => {
    if (selectedPeriod) {
      fetchChartData();
    }
  }, [selectedPeriod]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [kpi, reviewStats, orders, comms] = await Promise.all([
        sellerDashboardApi.getKPI(),
        sellerDashboardApi.getReviewStats(),
        sellerApi.getSellerOrders().catch(() => []),
        sellerDashboardApi.getCommissions().catch(() => []),
      ]);

      setKpiData(kpi);
      setReviewStatsData(reviewStats);
      setRecentOrders(
        Array.isArray(orders.content) ? orders.content.slice(0, 5) : []
      );
      setCommissions(comms || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const orderGrowth = await sellerDashboardApi.getOrderGrowth(selectedPeriod);
      setOrderGrowthData(orderGrowth);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast.error("Không thể tải dữ liệu biểu đồ");
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
    });
  };

  const formatPeriodLabel = (label, period) => {
    if (!label) return "-";

    if (period === "daily") {
      // Format: YYYY-MM-DD -> DD/MM/YYYY
      return formatDate(label);
    } else if (period === "weekly") {
      // Format: YYYY-WW (e.g., 2024-48) -> Tuần WW/YYYY
      const parts = String(label).split("-");
      if (parts.length === 2) {
        return `Tuần ${parts[1]}/${parts[0]}`;
      }
      return label;
    } else if (period === "monthly") {
      // Format: YYYY-MM -> Tháng MM/YYYY
      const parts = String(label).split("-");
      if (parts.length === 2) {
        return `T${parts[1]}/${parts[0]}`;
      }
      return label;
    }

    return label;
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

  const getStatusText = (status) => {
    const statusTextMap = {
      Pending: "Chờ Xử Lý",
      Processing: "Đang Xử Lý",
      Shipped: "Đang Giao",
      Delivered: "Đã Giao",
      Cancelled: "Đã Hủy",
    };
    return statusTextMap[status] || status || "Chờ Xử Lý";
  };

  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "Người Mua",
      dataIndex: "buyerName",
      key: "buyerName",
      render: (text) => text || "N/A",
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => formatPrice(amount || 0),
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => formatDate(date),
    },
  ];

  // Prepare chart data
  const chartData = orderGrowthData
    ? orderGrowthData.labels.map((label, index) => ({
      date: formatPeriodLabel(label, selectedPeriod),
      orders: orderGrowthData.orderCounts[index],
      revenue: orderGrowthData.revenues[index],
    }))
    : [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>
            {payload[0].payload.date}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: "4px 0", color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "Doanh thu"
                ? formatPrice(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="seller-content">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="seller-page-title">Tổng Quan</h1>
          <p className="seller-page-description">
            Xem tổng quan về hoạt động bán hàng của bạn
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => navigate("/seller/ghn-shop-info")}
            style={{ backgroundColor: "#008ECC", borderColor: "#008ECC", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Cấu hình GHN Shop
          </Button>
        </div>
      </div>

      {/* KPI Cards - 7 cards in one row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Tổng Doanh Thu</span>}
            value={kpiData?.totalRevenue || 0}
            prefix={<DollarOutlined style={{ fontSize: "24px" }} />}
            formatter={(value) => formatPrice(value)}
            valueStyle={{
              color: "#008ECC",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Tổng Đơn Hàng</span>}
            value={kpiData?.totalOrders || 0}
            prefix={<ShoppingOutlined style={{ fontSize: "24px" }} />}
            valueStyle={{
              color: "#008ECC",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Sản Phẩm</span>}
            value={kpiData?.totalProducts || 0}
            prefix={<ProductOutlined style={{ fontSize: "24px" }} />}
            valueStyle={{
              color: "#008ECC",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Đánh Giá TB</span>}
            value={kpiData?.averageRating || 0}
            prefix={<StarOutlined style={{ fontSize: "24px" }} />}
            suffix={<span style={{ fontSize: "14px" }}>/ 5</span>}
            precision={1}
            valueStyle={{
              color: "#faad14",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Đơn Chờ Xử Lý</span>}
            value={kpiData?.pendingOrders || 0}
            prefix={<ClockCircleOutlined style={{ fontSize: "24px" }} />}
            valueStyle={{
              color: "#FF9800",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Đơn Hoàn Thành</span>}
            value={kpiData?.completedOrders || 0}
            prefix={<CheckCircleOutlined style={{ fontSize: "24px" }} />}
            valueStyle={{
              color: "#52c41a",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
        <Card
          className="seller-stat-card"
          style={{
            flex: 1,
            minWidth: "120px",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Statistic
            title={<span style={{ fontSize: "14px" }}>Đơn Đã Hủy</span>}
            value={kpiData?.cancelledOrders || 0}
            prefix={<CloseCircleOutlined style={{ fontSize: "24px" }} />}
            valueStyle={{
              color: "#f5222d",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          />
        </Card>
      </div>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Order Growth Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <span>
                  Tăng Trưởng Đơn Hàng & Doanh Thu (
                  {selectedPeriod === "daily" ? "Theo Ngày" : selectedPeriod === "weekly" ? "Theo Tuần" : "Theo Tháng"})
                </span>
                <Segmented
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  options={[
                    { label: "Theo Ngày", value: "daily" },
                    { label: "Theo Tuần", value: "weekly" },
                    { label: "Theo Tháng", value: "monthly" },
                  ]}
                />
              </div>
            }
            className="seller-table"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#008ECC"
                  strokeWidth={2}
                  name="Số đơn hàng"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Review Stats */}
        <Col xs={24} lg={8}>
          <Card title="Thống Kê Đánh Giá" className="seller-table">
            <div style={{ marginBottom: "16px", textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#faad14",
                }}
              >
                {reviewStatsData?.averageRating?.toFixed(1) || "0.0"}
                <StarOutlined style={{ marginLeft: "8px", fontSize: "24px" }} />
              </div>
              <div style={{ color: "#666", marginTop: "4px" }}>
                {reviewStatsData?.totalReviews || 0} đánh giá
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  reviewStatsData?.[
                  `${["five", "four", "three", "two", "one"][5 - star]}Star`
                  ] || 0;
                const percent = reviewStatsData?.totalReviews
                  ? (count / reviewStatsData.totalReviews) * 100
                  : 0;
                return (
                  <div
                    key={star}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ width: "60px", fontSize: "14px" }}>
                      {star} <StarOutlined style={{ color: "#faad14" }} />
                    </span>
                    <Progress
                      percent={percent}
                      size="small"
                      strokeColor="#faad14"
                      showInfo={false}
                      style={{ flex: 1, marginRight: "8px" }}
                    />
                    <span
                      style={{
                        width: "40px",
                        textAlign: "right",
                        fontSize: "12px",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Commission Earnings Section */}
      <Card
        title="Hoa Hồng Nhận Được"
        className="seller-table"
        style={{ marginBottom: "24px" }}
      >
        <Row gutter={[16, 16]}>
          {/* Total Commission Card */}
          <Col xs={24} md={8}>
            <div style={{
              padding: "24px",
              backgroundColor: "#f6ffed",
              borderRadius: "8px",
              border: "2px solid #52c41a",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                Tổng Hoa Hồng
              </div>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#52c41a", marginBottom: "8px" }}>
                {formatPrice(kpiData?.totalCommission || 0)}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                Tỷ lệ: {kpiData?.commissionRate || 7}% của doanh thu
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                Từ {commissions.length} đơn hàng đã giao
              </div>
            </div>
          </Col>

          {/* Commission Table */}
          <Col xs={24} md={16}>
            <Table
              dataSource={commissions}
              rowKey="orderId"
              pagination={{ pageSize: 5, showSizeChanger: false }}
              size="small"
              locale={{ emptyText: "Chưa có đơn hàng Delivered" }}
              scroll={{ x: 600 }}
              columns={[
                {
                  title: "Mã Đơn",
                  dataIndex: "orderId",
                  key: "orderId",
                  width: 100,
                  render: (id) => `#${id}`,
                  fixed: 'left',
                },
                {
                  title: "Ngày Giao",
                  dataIndex: "orderDate",
                  key: "orderDate",
                  width: 120,
                  render: (date) => formatDate(date),
                },
                {
                  title: "Tổng Đơn Hàng",
                  dataIndex: "orderTotal",
                  key: "orderTotal",
                  width: 140,
                  render: (value) => (
                    <span style={{ fontWeight: "500" }}>
                      {formatPrice(value || 0)}
                    </span>
                  ),
                },
                {
                  title: "Tỷ Lệ",
                  dataIndex: "commissionRate",
                  key: "commissionRate",
                  width: 80,
                  align: "center",
                  render: (rate) => `${rate}%`,
                },
                {
                  title: "Hoa Hồng",
                  dataIndex: "commissionAmount",
                  key: "commissionAmount",
                  width: 140,
                  render: (value) => (
                    <span style={{
                      color: "#52c41a",
                      fontWeight: "bold",
                      fontSize: "15px"
                    }}>
                      +{formatPrice(value || 0)}
                    </span>
                  ),
                  fixed: 'right',
                },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Recent Orders Table */}
      <Card title="Đơn Hàng Gần Đây" className="seller-table">
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="orderId"
          pagination={false}
          locale={{ emptyText: "Chưa có đơn hàng nào" }}
        />
      </Card>
    </div>
  );
}
