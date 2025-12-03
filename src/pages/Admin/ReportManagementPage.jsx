import React, { useEffect, useState } from "react";
import {
    Table,
    Tag,
    Button,
    message,
    Space,
    Card,
    Typography,
    Modal,
    Image,
    Tabs,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import reportApi from "../../api/admin/reportApi.jsx";
import { Link } from "react-router-dom";
import "../../styles/AdminDashboard.css";

const { Title, Text } = Typography;

const ReportManagementPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [resolveModalVisible, setResolveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await reportApi.getAllReports();
            setReports(res || []);
        } catch (error) {
            message.error("Không thể tải danh sách báo cáo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const showResolveModal = (report) => {
        setSelectedReport(report);
        setResolveModalVisible(true);
    };

    const showRejectModal = (report) => {
        setSelectedReport(report);
        setRejectModalVisible(true);
    };

    const showDetailModal = (report) => {
        setSelectedReport(report);
        setDetailModalVisible(true);
    };

    const handleConfirmResolve = async () => {
        if (!selectedReport) return;
        const id = selectedReport.id;
        setActionLoading(id);
        setResolveModalVisible(false);

        try {
            await reportApi.updateReportStatus(id, "Resolved");
            message.success("Đã xử lý báo cáo thành công");
            fetchReports();
        } catch (error) {
            message.error("Xử lý báo cáo thất bại");
        } finally {
            setActionLoading(null);
            setSelectedReport(null);
        }
    };

    const handleConfirmReject = async () => {
        if (!selectedReport) return;
        const id = selectedReport.id;
        setActionLoading(id);
        setRejectModalVisible(false);

        try {
            await reportApi.updateReportStatus(id, "Rejected");
            message.success("Đã từ chối báo cáo");
            fetchReports();
        } catch (error) {
            message.error("Từ chối báo cáo thất bại");
        } finally {
            setActionLoading(null);
            setSelectedReport(null);
        }
    };

    const filteredReports = reports.filter((report) => {
        if (activeTab === "ALL") return true;
        return report.status === activeTab;
    });

    const columns = [
        {
            title: "Sản phẩm",
            key: "product",
            width: 250,
            render: (_, record) => (
                <Space>
                    <Image
                        width={40}
                        height={40}
                        src={record.productImage || "https://via.placeholder.com/50"}
                        fallback="https://via.placeholder.com/50"
                        style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Link to={`/product/${record.productId}`} target="_blank">
                            <Text strong style={{ fontSize: 13, color: "#1890ff" }}>
                                {record.product_name || `Sản phẩm #${record.productId}`}
                            </Text>
                        </Link>
                    </div>
                </Space>
            ),
        },
        {
            title: "Cửa hàng",
            dataIndex: "shop_name",
            key: "shop",
            width: 180,
            render: (text) => (
                <Text style={{ fontSize: 13 }}>{text || "N/A"}</Text>
            ),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => {
                let color = "default";
                let label = status;
                if (status === "Resolved") {
                    color = "success";
                    label = "Đã xử lý";
                }
                if (status === "Rejected") {
                    color = "error";
                    label = "Đã từ chối";
                }
                if (status === "Pending") {
                    color = "warning";
                    label = "Chờ xử lý";
                }
                return <Tag color={color}>{label}</Tag>;
            },
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
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    {record.status === "Pending" && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                style={{ background: "#52c41a", borderColor: "#52c41a", fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                icon={<CheckCircleOutlined />}
                                loading={actionLoading === record.id}
                                onClick={() => showResolveModal(record)}
                            >
                                Duyệt
                            </Button>
                            <Button
                                danger
                                type="primary"
                                size="small"
                                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                icon={<CloseCircleOutlined />}
                                loading={actionLoading === record.id}
                                onClick={() => showRejectModal(record)}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                    <Button
                        type="default"
                        size="small"
                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        icon={<EyeOutlined />}
                        onClick={() => showDetailModal(record)}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="content-admin-dashboard" style={{ padding: 24 }}>
            <div className="dashboard-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Quản lý báo cáo
                    </Title>
                    <Text type="secondary">
                        Danh sách các báo cáo vi phạm từ người dùng
                    </Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchReports}
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
                    { key: "Pending", label: "Chờ Xử Lý" },
                    { key: "Resolved", label: "Đã Xử Lý" },
                    { key: "Rejected", label: "Đã Từ Chối" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card className="chart-card" bordered={false} bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={filteredReports}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: "Không có báo cáo nào" }}
                />
            </Card>

            {/* Resolve Modal */}
            <Modal
                title="Xác nhận xử lý báo cáo"
                open={resolveModalVisible}
                onOk={handleConfirmResolve}
                onCancel={() => setResolveModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ style: { background: "#52c41a", borderColor: "#52c41a" } }}
            >
                <p>Bạn có chắc chắn muốn đánh dấu báo cáo này là <strong>Đã xử lý</strong>?</p>
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối báo cáo"
                open={rejectModalVisible}
                onOk={handleConfirmReject}
                onCancel={() => setRejectModalVisible(false)}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc chắn muốn từ chối báo cáo này?</p>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết báo cáo"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {selectedReport && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <Text strong>Sản phẩm: </Text>
                            <Link to={`/product/${selectedReport.productId}`} target="_blank">
                                {selectedReport.product_name || `Sản phẩm #${selectedReport.productId}`}
                            </Link>
                        </div>
                        <div>
                            <Text strong>Cửa hàng: </Text>
                            <Text>{selectedReport.shop_name}</Text>
                        </div>
                        <div>
                            <Text strong>Người báo cáo: </Text>
                            <Text>{selectedReport.buyerName || `ID: ${selectedReport.buyerId}`}</Text>
                        </div>
                        <div>
                            <Text strong>Lý do: </Text>
                            <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                {selectedReport.reason}
                            </div>
                        </div>
                        <div>
                            <Text strong>Trạng thái: </Text>
                            <Tag color={selectedReport.status === 'Resolved' ? 'success' : selectedReport.status === 'Rejected' ? 'error' : 'warning'}>
                                {selectedReport.status === 'Resolved' ? 'Đã xử lý' : selectedReport.status === 'Rejected' ? 'Đã từ chối' : 'Chờ xử lý'}
                            </Tag>
                        </div>
                        <div>
                            <Text strong>Ngày tạo: </Text>
                            <Text>{selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString('vi-VN') : 'N/A'}</Text>
                        </div>

                        <div>
                            <Text strong>Hình ảnh/Video minh chứng: </Text>
                            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {selectedReport.media && selectedReport.media.length > 0 ? (
                                    selectedReport.media.map((item, index) => (
                                        <div key={index} style={{ border: '1px solid #d9d9d9', padding: '4px', borderRadius: '4px' }}>
                                            {item.mediaType === 'video' ? (
                                                <video
                                                    src={item.url}
                                                    controls
                                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Image
                                                    width={150}
                                                    height={150}
                                                    src={item.url}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <Text type="secondary">Không có hình ảnh/video minh chứng</Text>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReportManagementPage;
