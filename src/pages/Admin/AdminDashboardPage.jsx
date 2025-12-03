import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  message,
  Spin,
  Statistic,
  Radio,
  Table,
  DatePicker,
  Select,
  Space,
  Tag,
  Divider,
  Typography,
} from "antd";
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  FilterOutlined,
  ReloadOutlined,
  TrophyOutlined,
  EyeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
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
import dayjs from "dayjs";
import adminDashboardApi from "../../api/admin/adminDashboardApi";
import categoryApi from "../../api/catalog/categoryApi";
import "../../styles/AdminDashboard.css";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Format currency helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

// Revenue KPI Cards Component
function RevenueKPICards({ data, loading }) {
  if (!data) return null;

  const totalRevenue =
    typeof data.totalRevenue === "string"
      ? parseFloat(data.totalRevenue)
      : data.totalRevenue || 0;
  const commission =
    typeof data.commission === "string"
      ? parseFloat(data.commission)
      : data.commission || 0;
  const avgOrderValue =
    typeof data.averageOrderValue === "string"
      ? parseFloat(data.averageOrderValue)
      : data.averageOrderValue || 0;
  const totalOrders = data.totalOrders || 0;
  const commissionPercent =
    totalRevenue > 0 ? ((commission / totalRevenue) * 100).toFixed(2) : "0.00";

  const kpis = [
    {
      title: "Tổng Doanh Thu",
      value: totalRevenue,
      formatter: formatCurrency,
      prefix: <DollarOutlined />,
      color: "#1890ff",
      description: `${totalOrders} đơn hàng đã giao`,
    },
    {
      title: "Hoa Hồng Admin (7%)",
      value: commission,
      formatter: formatCurrency,
      prefix: <DollarOutlined />,
      color: "#52c41a",
      description: `${commissionPercent}% từ doanh thu`,
    },
    {
      title: "Trung Bình Đơn Hàng",
      value: avgOrderValue,
      formatter: formatCurrency,
      prefix: <DollarOutlined />,
      color: "#faad14",
      description: `Giá trị trung bình mỗi đơn`,
    },
    {
      title: "Tổng Số Đơn",
      value: totalOrders,
      prefix: <DollarOutlined />,
      color: "#722ed1",
      description: `Đơn hàng đã giao thành công`,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      {kpis.map((kpi, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card className="kpi-card" loading={loading}>
            <Statistic
              title={kpi.title}
              value={kpi.value}
              formatter={kpi.formatter}
              prefix={kpi.prefix}
              valueStyle={{
                color: kpi.color,
                fontSize: "20px",
                fontWeight: 600,
              }}
            />
            {kpi.description && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#8c8c8c",
                }}
              >
                {kpi.description}
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// Filter Panel Component
function FilterPanel({
  filters,
  onFilterChange,
  sellers,
  categories,
  loading,
}) {
  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ Lọc</span>
        </Space>
      }
      style={{ marginBottom: "24px" }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: "8px", fontWeight: 600 }}>
            Khoảng Thời Gian
          </div>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) =>
              onFilterChange({ ...filters, dateRange: dates })
            }
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: "8px", fontWeight: 600 }}>
            Loại Báo Cáo
          </div>
          <Radio.Group
            value={filters.periodType}
            onChange={(e) =>
              onFilterChange({ ...filters, periodType: e.target.value })
            }
            style={{ width: "100%" }}
          >
            <Radio.Button
              value="daily"
              style={{ width: "25%", textAlign: "center" }}
            >
              Ngày
            </Radio.Button>
            <Radio.Button
              value="monthly"
              style={{ width: "25%", textAlign: "center" }}
            >
              Tháng
            </Radio.Button>
            <Radio.Button
              value="quarterly"
              style={{ width: "25%", textAlign: "center" }}
            >
              Quý
            </Radio.Button>
            <Radio.Button
              value="yearly"
              style={{ width: "25%", textAlign: "center" }}
            >
              Năm
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: "8px", fontWeight: 600 }}>
            Lọc Theo Seller
          </div>
          <Select
            placeholder="Tất cả seller"
            allowClear
            value={filters.sellerId}
            onChange={(value) =>
              onFilterChange({ ...filters, sellerId: value })
            }
            style={{ width: "100%" }}
            loading={loading}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.trim().toLowerCase())
            }
            options={sellers.map((seller) => ({
              label: seller.sellerName,
              value: seller.sellerId,
            }))}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div style={{ marginBottom: "8px", fontWeight: 600 }}>
            Lọc Theo Danh Mục
          </div>
          <Select
            placeholder="Tất cả danh mục"
            allowClear
            value={filters.categoryId}
            onChange={(value) =>
              onFilterChange({ ...filters, categoryId: value })
            }
            style={{ width: "100%" }}
            loading={loading}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.trim().toLowerCase())
            }
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Col>
      </Row>
    </Card>
  );
}

// Format period label helper
const formatPeriodLabel = (period, type) => {
  if (!period) return "";

  try {
    if (type === "daily") {
      // period format: "YYYY-MM-DD"
      const date = dayjs(period);
      if (date.isValid()) {
        return date.format("DD/MM");
      }
      return period;
    } else if (type === "monthly") {
      // period format: "YYYY-MM"
      const parts = period.split("-");
      if (parts.length === 2) {
        return `T${parts[1]}/${parts[0]}`;
      }
      return period;
    } else if (type === "quarterly") {
      // period format: "2024-Q1" hoặc "2024-Q2" hoặc "2024-Q3" hoặc "2024-Q4"
      if (typeof period === "string") {
        const match = period.match(/(\d{4})-Q(\d{1,2})/);
        if (match) {
          const year = match[1];
          const quarter = match[2];
          return `Q${quarter}/${year}`;
        }
        // Thử format khác nếu không match
        const parts = period.split("-Q");
        if (parts.length === 2) {
          return `Q${parts[1]}/${parts[0]}`;
        }
      }
      return period;
    } else if (type === "yearly") {
      // period format: "2024" (number) hoặc "YYYY" (string)
      const year = typeof period === "number" ? period.toString() : period;
      return `Năm ${year}`;
    }
    return period;
  } catch (error) {
    console.error("Error formatting period:", error, period, type);
    return period;
  }
};

// Revenue Chart Component
function RevenueChart({ data, periodType, loading }) {
  if (!data || !data.revenueByPeriod || data.revenueByPeriod.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#8c8c8c" }}>
        Không có dữ liệu
      </div>
    );
  }

  const chartData = data.revenueByPeriod.map((item) => {
    const revenue =
      typeof item.revenue === "string"
        ? parseFloat(item.revenue)
        : item.revenue || 0;
    const commission =
      typeof item.commission === "string"
        ? parseFloat(item.commission)
        : item.commission || 0;
    const periodStr = item.period ? String(item.period) : "";
    return {
      period: formatPeriodLabel(periodStr, periodType),
      revenue: isNaN(revenue) ? 0 : revenue,
      commission: isNaN(commission) ? 0 : commission,
      orders: item.orderCount || 0,
    };
  });

  return (
    <Spin spinning={loading}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "revenue")
                return [formatCurrency(value), "Doanh Thu"];
              if (name === "commission")
                return [formatCurrency(value), "Hoa Hồng"];
              return [value, "Số Đơn"];
            }}
            labelStyle={{ color: "#000" }}
          />
          <Legend
            formatter={(value) => {
              if (value === "revenue") return "Doanh Thu";
              if (value === "commission") return "Hoa Hồng (7%)";
              return "Số Đơn";
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="revenue"
            stroke="#1890ff"
            strokeWidth={3}
            dot={{ fill: "#1890ff", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="commission"
            name="commission"
            stroke="#52c41a"
            strokeWidth={3}
            dot={{ fill: "#52c41a", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Spin>
  );
}

// Top Sellers Table Component
function TopSellersTable({ data, loading }) {
  const columns = [
    {
      title: "#",
      key: "rank",
      width: 60,
      render: (_, __, index) => {
        const rank = index + 1;
        let icon = null;
        if (rank === 1) icon = <TrophyOutlined style={{ color: "#FFD700" }} />;
        else if (rank === 2)
          icon = <TrophyOutlined style={{ color: "#C0C0C0" }} />;
        else if (rank === 3)
          icon = <TrophyOutlined style={{ color: "#CD7F32" }} />;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {icon}
            <span style={{ fontWeight: rank <= 3 ? 700 : 400 }}>{rank}</span>
          </div>
        );
      },
    },
    {
      title: "Tên Shop",
      dataIndex: "shopName",
      key: "shopName",
      render: (text, record, index) => (
        <span style={{ fontWeight: index < 3 ? 600 : 400 }}>{text}</span>
      ),
    },
    {
      title: "Doanh Thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value, record, index) => {
        const revenueValue =
          typeof value === "string" ? parseFloat(value) : value || 0;
        return (
          <span
            style={{
              fontWeight: index < 3 ? 600 : 400,
              color: index < 3 ? "#1890ff" : "inherit",
            }}
          >
            {formatCurrency(revenueValue)}
          </span>
        );
      },
      sorter: (a, b) => {
        const revenueA =
          typeof a.revenue === "string"
            ? parseFloat(a.revenue)
            : a.revenue || 0;
        const revenueB =
          typeof b.revenue === "string"
            ? parseFloat(b.revenue)
            : b.revenue || 0;
        return revenueA - revenueB;
      },
    },
    {
      title: "Hoa Hồng (7%)",
      dataIndex: "commission",
      key: "commission",
      render: (value, record, index) => {
        const commissionValue =
          typeof value === "string" ? parseFloat(value) : value || 0;
        return (
          <span
            style={{
              fontWeight: index < 3 ? 600 : 400,
              color: index < 3 ? "#52c41a" : "inherit",
            }}
          >
            {formatCurrency(commissionValue)}
          </span>
        );
      },
      sorter: (a, b) => {
        const commissionA =
          typeof a.commission === "string"
            ? parseFloat(a.commission)
            : a.commission || 0;
        const commissionB =
          typeof b.commission === "string"
            ? parseFloat(b.commission)
            : b.commission || 0;
        return commissionA - commissionB;
      },
    },
    {
      title: "Số Đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      width: 100,
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="sellerId"
      loading={loading}
      pagination={false}
      size="small"
      scroll={{ y: 350 }}
    />
  );
}

// Category Revenue Table Component
function CategoryRevenueTable({ data, loading }) {
  const columns = [
    {
      title: "Danh Mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Doanh Thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => {
        const revenueValue =
          typeof value === "string" ? parseFloat(value) : value || 0;
        return (
          <span style={{ color: "#1890ff", fontWeight: 500 }}>
            {formatCurrency(revenueValue)}
          </span>
        );
      },
      sorter: (a, b) => {
        const revenueA =
          typeof a.revenue === "string"
            ? parseFloat(a.revenue)
            : a.revenue || 0;
        const revenueB =
          typeof b.revenue === "string"
            ? parseFloat(b.revenue)
            : b.revenue || 0;
        return revenueA - revenueB;
      },
    },
    {
      title: "Hoa Hồng (7%)",
      dataIndex: "commission",
      key: "commission",
      render: (value) => {
        const commissionValue =
          typeof value === "string" ? parseFloat(value) : value || 0;
        return (
          <span style={{ color: "#52c41a", fontWeight: 500 }}>
            {formatCurrency(commissionValue)}
          </span>
        );
      },
      sorter: (a, b) => {
        const commissionA =
          typeof a.commission === "string"
            ? parseFloat(a.commission)
            : a.commission || 0;
        const commissionB =
          typeof b.commission === "string"
            ? parseFloat(b.commission)
            : b.commission || 0;
        return commissionA - commissionB;
      },
    },
    {
      title: "Số Đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      width: 100,
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="categoryId"
      loading={loading}
      pagination={false}
      size="small"
      scroll={{ y: 350 }}
    />
  );
}

// Order Details Table Component
function OrderDetailsTable({ data, loading, filters, sellers, categories }) {
  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: "Ngày Đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Cửa Hàng",
      dataIndex: "shopName",
      key: "shopName",
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>
            {record.sellerEmail}
          </div>
        </div>
      ),
    },
    {
      title: "Người Mua",
      dataIndex: "buyerName",
      key: "buyerName",
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>
            {record.buyerEmail}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng Tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      width: 120,
      render: (value) => {
        const amount =
          typeof value === "string" ? parseFloat(value) : value || 0;
        return (
          <span style={{ color: "#1890ff", fontWeight: 500 }}>
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      title: "Hoa Hồng (7%)",
      dataIndex: "commission",
      key: "commission",
      width: 130,
      render: (value) => {
        const commission =
          typeof value === "string" ? parseFloat(value) : value || 0;
        return (
          <span style={{ color: "#52c41a", fontWeight: 600 }}>
            {formatCurrency(commission)}
          </span>
        );
      },
    },
    {
      title: "Phương Thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (method) => (
        <Tag color={method === "COD" ? "orange" : "blue"}>
          {method || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 100,
      render: (status) => <Tag color="green">{"Đã giao hàng" || "N/A"}</Tag>,
    },
  ];

  const expandedRowRender = (record) => {
    const items = record.items || [];

    const itemColumns = [
      {
        title: "Sản Phẩm",
        dataIndex: "productName",
        key: "productName",
        render: (text, item) => (
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: "11px", color: "#8c8c8c" }}>
              Danh mục: {item.categoryName}
            </div>
          </div>
        ),
      },
      {
        title: "Số Lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: 80,
        align: "center",
      },
      {
        title: "Đơn Giá",
        dataIndex: "unitPrice",
        key: "unitPrice",
        width: 120,
        render: (value) => {
          const price =
            typeof value === "string" ? parseFloat(value) : value || 0;
          return formatCurrency(price);
        },
      },
      {
        title: "Thành Tiền",
        dataIndex: "subtotal",
        key: "subtotal",
        width: 130,
        render: (value) => {
          const subtotal =
            typeof value === "string" ? parseFloat(value) : value || 0;
          return (
            <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
          );
        },
      },
      {
        title: "Hoa Hồng (7%)",
        dataIndex: "itemCommission",
        key: "itemCommission",
        width: 130,
        render: (value) => {
          const commission =
            typeof value === "string" ? parseFloat(value) : value || 0;
          return (
            <span style={{ color: "#52c41a", fontWeight: 500 }}>
              {formatCurrency(commission)}
            </span>
          );
        },
      },
    ];

    return (
      <div style={{ padding: "16px", background: "#fafafa" }}>
        <div
          style={{ marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}
        >
          Chi Tiết Sản Phẩm ({items.length} sản phẩm)
        </div>
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="productId"
          pagination={false}
          size="small"
        />
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "white",
            borderRadius: "4px",
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                Tổng tiền hàng:
              </div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {formatCurrency(
                  typeof record.totalAmount === "string"
                    ? parseFloat(record.totalAmount)
                    : record.totalAmount || 0
                )}
              </div>
            </Col>
            <Col span={6}>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                Giảm giá:
              </div>
              <div style={{ fontSize: "14px" }}>
                {formatCurrency(
                  typeof record.discountAmount === "string"
                    ? parseFloat(record.discountAmount)
                    : record.discountAmount || 0
                )}
              </div>
            </Col>
            <Col span={6}>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                Phí ship:
              </div>
              <div style={{ fontSize: "14px" }}>
                {formatCurrency(
                  typeof record.shippingFee === "string"
                    ? parseFloat(record.shippingFee)
                    : record.shippingFee || 0
                )}
              </div>
            </Col>
            <Col span={6}>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                Tổng thanh toán:
              </div>
              <div
                style={{ fontSize: "16px", fontWeight: 600, color: "#1890ff" }}
              >
                {formatCurrency(
                  typeof record.finalAmount === "string"
                    ? parseFloat(record.finalAmount)
                    : record.finalAmount || 0
                )}
              </div>
            </Col>
          </Row>
          <Divider style={{ margin: "12px 0" }} />
          <Row>
            <Col span={24}>
              <div
                style={{ fontSize: "14px", fontWeight: 600, color: "#52c41a" }}
              >
                Tổng Hoa Hồng Admin:{" "}
                {formatCurrency(
                  typeof record.commission === "string"
                    ? parseFloat(record.commission)
                    : record.commission || 0
                )}
              </div>
              <div
                style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "4px" }}
              >
                (7% của tổng thanh toán)
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="orderId"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} đơn hàng`,
      }}
      expandable={{
        expandedRowRender,
        expandIcon: ({ expanded, onExpand, record }) => (
          <EyeOutlined
            style={{ fontSize: "16px", cursor: "pointer" }}
            onClick={(e) => onExpand(record, e)}
          />
        ),
      }}
      scroll={{ x: "max-content" }}
      size="middle"
    />
  );
}

// Main Component
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [dayjs().subtract(1, "month"), dayjs()],
    periodType: "daily",
    sellerId: null,
    categoryId: null,
  });

  // Fetch sellers and categories
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sellersData, categoriesData] = await Promise.all([
          adminDashboardApi.getSellers(),
          categoryApi.getCategories(),
        ]);
        setSellers(sellersData || []);
        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData?.data || []
        );
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, []);

  // Fetch revenue data
  const fetchRevenueData = async () => {
    if (!filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1]) {
      message.warning("Vui lòng chọn khoảng thời gian");
      return;
    }

    setLoading(true);
    try {
      const params = {
        startDate: filters.dateRange[0].format("YYYY-MM-DD"),
        endDate: filters.dateRange[1].format("YYYY-MM-DD"),
        periodType: filters.periodType || "daily",
      };

      if (filters.sellerId) {
        params.sellerId = filters.sellerId;
      }

      if (filters.categoryId) {
        params.categoryId = filters.categoryId;
      }

      const data = await adminDashboardApi.getAdminRevenue(params);
      setRevenueData(data);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      message.error(
        error.response?.data?.message || "Không thể tải dữ liệu doanh thu"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1]) {
      message.warning("Vui lòng chọn khoảng thời gian");
      return;
    }

    setOrderDetailsLoading(true);
    try {
      const params = {
        startDate: filters.dateRange[0].format("YYYY-MM-DD"),
        endDate: filters.dateRange[1].format("YYYY-MM-DD"),
      };

      if (filters.sellerId) {
        params.sellerId = filters.sellerId;
      }

      if (filters.categoryId) {
        params.categoryId = filters.categoryId;
      }

      const data = await adminDashboardApi.getOrderDetails(params);
      setOrderDetails(data || []);
    } catch (error) {
      console.error("Error fetching order details:", error);
      message.error(
        error.response?.data?.message || "Không thể tải danh sách đơn hàng"
      );
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      fetchRevenueData();
      fetchOrderDetails();
    }
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    const newFilters = {
      dateRange: [dayjs().subtract(1, "month"), dayjs()],
      periodType: "daily",
      sellerId: null,
      categoryId: null,
    };
    setFilters(newFilters);
    // Reset sẽ trigger useEffect để fetch lại data
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <Title level={2} style={{ margin: 0, fontSize: "28px" }}>
            Quản Lý Doanh Thu
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Theo dõi doanh thu và hoa hồng từ các đơn hàng đã giao (7% hoa hồng)
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchRevenueData}
            loading={loading}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Làm Mới
          </Button>
          <Button onClick={handleResetFilters}>Đặt Lại Bộ Lọc</Button>
        </Space>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        sellers={sellers}
        categories={categories}
        loading={loading}
      />

      <Spin spinning={loading}>
        <RevenueKPICards data={revenueData} loading={loading} />

        {revenueData?.sellerStats && (
          <Card
            title="Thống Kê Người Bán"
            style={{ marginBottom: "24px" }}
            className="chart-card"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Tên Cửa Hàng"
                  value={revenueData.sellerStats.shopName}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Tổng Doanh Thu"
                  value={
                    typeof revenueData.sellerStats.totalRevenue === "string"
                      ? parseFloat(revenueData.sellerStats.totalRevenue)
                      : revenueData.sellerStats.totalRevenue || 0
                  }
                  formatter={formatCurrency}
                  valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Tổng Hoa Hồng"
                  value={
                    typeof revenueData.sellerStats.totalCommission === "string"
                      ? parseFloat(revenueData.sellerStats.totalCommission)
                      : revenueData.sellerStats.totalCommission || 0
                  }
                  formatter={formatCurrency}
                  valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Trung Bình Đơn Hàng"
                  value={
                    typeof revenueData.sellerStats.averageOrderValue ===
                      "string"
                      ? parseFloat(revenueData.sellerStats.averageOrderValue)
                      : revenueData.sellerStats.averageOrderValue || 0
                  }
                  formatter={formatCurrency}
                  valueStyle={{ color: "#faad14", fontSize: "16px" }}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card title="Biểu Đồ Doanh Thu & Hoa Hồng" className="chart-card">
              <RevenueChart
                data={revenueData}
                periodType={filters.periodType}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={12}>
            <Card
              title="Top Người Bán Hàng Theo Doanh Thu"
              className="chart-card"
            >
              <TopSellersTable
                data={revenueData?.topSellers || []}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Doanh Thu Theo Danh Mục" className="chart-card">
              <CategoryRevenueTable
                data={revenueData?.revenueByCategory || []}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title={
                <Space>
                  <ShoppingOutlined />
                  <span>
                    Chi Tiết Đơn Hàng
                    {filters.sellerId && (
                      <Tag color="blue" style={{ marginLeft: "8px" }}>
                        Tên Nhà bán Hàng:{" "}
                        {sellers.find((s) => s.sellerId === filters.sellerId)
                          ?.sellerName || "N/A"}
                      </Tag>
                    )}
                    {filters.categoryId && (
                      <Tag color="green" style={{ marginLeft: "8px" }}>
                        Danh mục:{" "}
                        {categories.find((c) => c.id === filters.categoryId)
                          ?.name || "N/A"}
                      </Tag>
                    )}
                    <Tag color="orange" style={{ marginLeft: "8px" }}>
                      {orderDetails.length} đơn
                    </Tag>
                  </span>
                </Space>
              }
              className="chart-card"
              extra={
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchOrderDetails}
                  loading={orderDetailsLoading}
                  size="small"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Làm Mới
                </Button>
              }
            >
              {orderDetails.length === 0 && !orderDetailsLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#8c8c8c",
                  }}
                >
                  {filters.dateRange &&
                    filters.dateRange[0] &&
                    filters.dateRange[1] ? (
                    <>
                      <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                        Không có đơn hàng nào trong khoảng thời gian đã chọn
                      </div>
                      <div style={{ fontSize: "12px", color: "#bfbfbf" }}>
                        {filters.sellerId &&
                          `Seller: ${sellers.find((s) => s.sellerId === filters.sellerId)
                            ?.sellerName || "N/A"
                          }`}
                        {filters.categoryId &&
                          ` | Danh mục: ${categories.find((c) => c.id === filters.categoryId)
                            ?.name || "N/A"
                          }`}
                      </div>
                    </>
                  ) : (
                    "Vui lòng chọn khoảng thời gian để xem đơn hàng"
                  )}
                </div>
              ) : (
                <OrderDetailsTable
                  data={orderDetails}
                  loading={orderDetailsLoading}
                  filters={filters}
                  sellers={sellers}
                  categories={categories}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
