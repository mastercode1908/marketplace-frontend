import { useState, useEffect } from "react";
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    Popconfirm,
    message,
    Descriptions,
    Image,
    Alert,
} from "antd";
import {
    PlusOutlined,
    EyeOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    DeleteOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import sellerBannerApi from "../../api/seller/sellerBannerApi";
import { toast } from "react-hot-toast";
import "../../styles/SellerLayout.css";

export default function SellerBannerManagementPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [hasActivePackage, setHasActivePackage] = useState(true); // TODO: Check from API

    useEffect(() => {
        fetchBanners();
        // TODO: Add API call to check if seller has active banner package
        // checkBannerPackage();
    }, [pagination.current, pagination.pageSize]);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await sellerBannerApi.getMyBanners(
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
            const detail = await sellerBannerApi.getBannerById(record.bannerId);
            setSelectedBanner(detail);
            setDetailModalVisible(true);
        } catch (error) {
            console.error("Error fetching banner detail:", error);
            toast.error("Không thể tải chi tiết banner");
        }
    };

    const handlePause = async (bannerId) => {
        try {
            await sellerBannerApi.pauseBanner(bannerId);
            toast.success("Đã tạm dừng banner");
            fetchBanners();
        } catch (error) {
            console.error("Error pausing banner:", error);
            toast.error("Không thể tạm dừng banner");
        }
    };

    const handleResume = async (bannerId) => {
        try {
            await sellerBannerApi.resumeBanner(bannerId);
            toast.success("Đã tiếp tục banner");
            fetchBanners();
        } catch (error) {
            console.error("Error resuming banner:", error);
            toast.error("Không thể tiếp tục banner");
        }
    };

    const handleDelete = async (bannerId) => {
        try {
            await sellerBannerApi.deleteBanner(bannerId);
            toast.success("Đã xóa banner");
            fetchBanners();
        } catch (error) {
            console.error("Error deleting banner:", error);
            toast.error("Không thể xóa banner");
        }
    };

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
            title: "Tiêu Đề",
            dataIndex: "title",
            key: "title",
            render: (text) => text,
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
            title: "Ngày Bắt Đầu",
            dataIndex: "startDate",
            key: "startDate",
            render: (date) => formatDate(date),
        },
        {
            title: "Ngày Kết Thúc",
            dataIndex: "endDate",
            key: "endDate",
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
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Xem
                    </Button>
                    {(record.status === "PENDING" || record.status === "PAUSED" || record.status === "REJECTED") && (
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/seller/banners/${record.bannerId}/edit`)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Sửa
                        </Button>
                    )}
                    {record.status === "ACTIVE" && (
                        <Button
                            type="link"
                            icon={<PauseCircleOutlined />}
                            onClick={() => handlePause(record.bannerId)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Tạm dừng
                        </Button>
                    )}
                    {record.status === "PAUSED" && (
                        <Button
                            type="link"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleResume(record.bannerId)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Tiếp tục
                        </Button>
                    )}
                    {(record.status === "PENDING" || record.status === "REJECTED") && (
                        <Popconfirm
                            title="Xóa banner này?"
                            description="Bạn có chắc chắn muốn xóa banner này?"
                            onConfirm={() => handleDelete(record.bannerId)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="link" danger icon={<DeleteOutlined />} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="seller-content font-sans">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h1 className="seller-page-title">Quản Lý Banner Quảng Cáo</h1>
                    <p className="seller-page-description">
                        Quản lý các banner quảng cáo sản phẩm của bạn
                    </p>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchBanners} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        Làm mới
                    </Button>
                    {hasActivePackage && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/seller/banners/create")}
                            style={{ backgroundColor: "#008ECC", borderColor: "#008ECC", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Tạo Banner Mới
                        </Button>
                    )}
                </Space>
            </div>

            {!hasActivePackage && (
                <Alert
                    message="Bạn chưa mua gói dịch vụ tạo banner quảng cáo"
                    description="Vui lòng mua gói dịch vụ để có thể tạo banner quảng cáo cho sản phẩm của bạn."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    action={
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => navigate("/seller/service-packages")}
                        >
                            Mua gói ngay
                        </Button>
                    }
                    style={{ marginBottom: "24px" }}
                />
            )}

            <Card className="seller-table">
                <Table
                    columns={columns}
                    dataSource={banners}
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
                            style={{ width: "100%", marginBottom: "16px", borderRadius: "8px" }}
                        />
                        <Descriptions bordered column={1}>
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
                            <Descriptions.Item label="Vị Trí">
                                {selectedBanner.position}
                            </Descriptions.Item>
                            <Descriptions.Item label="Độ Ưu Tiên">
                                {selectedBanner.priority}
                            </Descriptions.Item>
                            {selectedBanner.status === "REJECTED" && selectedBanner.rejectionReason && (
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
        </div>
    );
}
