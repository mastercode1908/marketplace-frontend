import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Tabs,
  Descriptions,
  Image,
  Form,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import adminBannerApi from "../../api/admin/adminBannerApi";
import { toast } from "react-hot-toast";

const { TextArea } = Input;

export default function ContentAdminBannerPage() {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBanners();
  }, [pagination.current, pagination.pageSize]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await adminBannerApi.getAllBanners(
        pagination.current - 1,
        pagination.pageSize
      );
      setBanners(response.content || []);
      setPagination({
        ...pagination,
        total: response.totalElements || 0,
      });
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: "orange",
      ACTIVE: "green",
      PAUSED: "blue",
      REJECTED: "red",
      COMPLETED: "default",
    };
    return colorMap[status] || "default";
  };

  const getStatusText = (status) => {
    const textMap = {
      PENDING: "Chờ Duyệt",
      ACTIVE: "Đang Hoạt Động",
      PAUSED: "Tạm Dừng",
      REJECTED: "Bị Từ Chối",
      COMPLETED: "Đã Kết Thúc",
    };
    return textMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetail = async (record) => {
    try {
      const detail = await adminBannerApi.getBannerById(record.bannerId);
      setSelectedBanner(detail);
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching banner detail:", error);
      toast.error("Không thể tải chi tiết banner");
    }
  };

  const handleApprove = async (bannerId) => {
    try {
      await adminBannerApi.approveBanner(bannerId);
      toast.success("Đã duyệt banner thành công");
      fetchBanners();
    } catch (error) {
      console.error("Error approving banner:", error);
      toast.error("Không thể duyệt banner");
    }
  };

  const handleRejectClick = (record) => {
    setSelectedBanner(record);
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    try {
      await adminBannerApi.rejectBanner(
        selectedBanner.bannerId,
        values.rejectionReason
      );
      toast.success("Đã từ chối banner");
      setRejectModalVisible(false);
      form.resetFields();
      fetchBanners();
    } catch (error) {
      console.error("Error rejecting banner:", error);
      toast.error("Không thể từ chối banner");
    }
  };

  const filteredBanners = banners.filter((banner) => {
    if (activeTab === "ALL") return true;
    return banner.status === activeTab;
  });

  const columns = [
    {
      title: "Hình Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (url) => (
        <Image
          src={url}
          alt="Banner"
          width={80}
          height={50}
          style={{ objectFit: "cover", borderRadius: "4px" }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: "Tên Cửa Hàng",
      dataIndex: "shopName",
      key: "shopName",
      width: 150,
    },
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },

    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Xem
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                style={{
                  color: "#52c41a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleApprove(record.bannerId)}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectClick(record)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "ALL",
      label: "Tất Cả",
      children: null,
    },
    {
      key: "PENDING",
      label: (
        <span>
          Chờ Duyệt{" "}
          <Tag color="orange">
            {banners.filter((b) => b.status === "PENDING").length}
          </Tag>
        </span>
      ),
      children: null,
    },
    {
      key: "ACTIVE",
      label: "Đã Duyệt",
      children: null,
    },
    {
      key: "REJECTED",
      label: "Bị Từ Chối",
      children: null,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>
            Quản Lý Banner Quảng Cáo
          </h1>
          <p style={{ color: "#666", margin: "4px 0 0 0" }}>
            Duyệt và quản lý các banner quảng cáo từ seller
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchBanners}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Làm mới
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: "16px" }}
        />

        <Table
          columns={columns}
          dataSource={filteredBanners}
          rowKey="bannerId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} banner`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: "Chưa có banner nào" }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Banner"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedBanner && (
          <div>
            <Image
              src={selectedBanner.imageUrl}
              alt="Banner"
              style={{
                width: "100%",
                marginBottom: "16px",
                borderRadius: "8px",
              }}
            />
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên Cửa Hàng">
                {selectedBanner.shopName}
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu Đề">
                {selectedBanner.title}
              </Descriptions.Item>
              <Descriptions.Item label="Mô Tả">
                {selectedBanner.description || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng Thái">
                <Tag color={getStatusColor(selectedBanner.status)}>
                  {getStatusText(selectedBanner.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Bắt Đầu">
                {formatDate(selectedBanner.startDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Kết Thúc">
                {formatDate(selectedBanner.endDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Tạo">
                {formatDate(selectedBanner.createdAt)}
              </Descriptions.Item>
              {selectedBanner.rejectionReason && (
                <Descriptions.Item label="Lý Do Từ Chối">
                  <span style={{ color: "red" }}>
                    {selectedBanner.rejectionReason}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ Chối Banner"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Từ Chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} onFinish={handleRejectSubmit} layout="vertical">
          <Form.Item
            name="rejectionReason"
            label="Lý do từ chối"
            rules={[
              { required: true, message: "Vui lòng nhập lý do từ chối" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối banner này (ví dụ: Hình ảnh không phù hợp, nội dung vi phạm chính sách...)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
