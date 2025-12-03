import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Tabs, Tag, Modal, Spin, Empty, Select } from "antd";
import {
    ShoppingCartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    GiftOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import servicePackageApi from "../../api/seller/servicePackageApi";
import sellerApi from "../../api/seller/sellerApi";
import productApi from "../../api/identity/productApi";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/SellerLayout.css";
import { ERROR_MESSAGES_VN } from "@/utils/constants";

const { TabPane } = Tabs;
const { Option } = Select;

export default function ServicePackagesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [availablePackages, setAvailablePackages] = useState([]);
    const [myPackages, setMyPackages] = useState([]);
    const [products, setProducts] = useState([]);
    const [promotedProductIds, setPromotedProductIds] = useState([]);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [promotionModalVisible, setPromotionModalVisible] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // console.log("DEBUG: user object:", user);
            // AuthProvider stores the full auth response in 'user', so the actual user info is in 'user.user'
            const userId = user?.user?.id || user?.user?.userId || user?.id || user?.userId || user?.sub;
            // console.log("DEBUG: extracted userId:", userId);

            if (!userId) {
                console.warn("Cannot determine userId from auth context");
                setLoading(false);
                return;
            }

            const [packagesRes, myPackagesRes, productsRes, promotedProductIdsRes] = await Promise.all([
                servicePackageApi.getAvailablePackages(),
                servicePackageApi.getMyPackages().catch(() => []),
                // Fetch products specifically for this shop
                productApi.getShopProducts(userId).catch((err) => {
                    console.error("Error fetching shop products:", err);
                    return [];
                }),
                servicePackageApi.getPromotedProductIds().catch(() => []),
            ]);

            setAvailablePackages(packagesRes.content || packagesRes || []);
            setMyPackages(Array.isArray(myPackagesRes) ? myPackagesRes : [myPackagesRes].filter(Boolean));
            setPromotedProductIds(promotedProductIdsRes || []);

            // Handle different response structures for products
            let shopProducts = [];
            if (productsRes?.content && Array.isArray(productsRes.content)) {
                shopProducts = productsRes.content;
            } else if (productsRes?.data && Array.isArray(productsRes.data)) {
                shopProducts = productsRes.data;
            } else if (Array.isArray(productsRes)) {
                shopProducts = productsRes;
            }

            setProducts(shopProducts);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Không thể tải dữ liệu gói dịch vụ");
        } finally {
            setLoading(false);
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
        return date.toLocaleDateString("vi-VN");
    };

    const getPackageIcon = (type) => {
        const iconMap = {
            Promotion: <GiftOutlined style={{ fontSize: "32px", color: "#52c41a" }} />,
            Content: <ThunderboltOutlined style={{ fontSize: "32px", color: "#1890ff" }} />,
            "Content Extra": <ThunderboltOutlined style={{ fontSize: "32px", color: "#faad14" }} />,
            Reputation: <CheckCircleOutlined style={{ fontSize: "32px", color: "#722ed1" }} />,
        };
        return iconMap[type] || <ShoppingCartOutlined style={{ fontSize: "32px" }} />;
    };

    const isPackageActive = (pkgId) => {
        return myPackages.some(p => {
            // Check if it matches the package ID
            if (p.packageId !== pkgId) return false;

            // Check status
            if (p.status !== 'Active') return false;

            // Check expiration
            if (p.endDate && new Date(p.endDate) < new Date()) return false;

            // Check usage limit (if applicable and tracked)
            if (p.remainingUsage !== null && p.remainingUsage <= 0) return false;

            return true;
        });
    };

    const handlePurchaseClick = (pkg) => {
        setSelectedPackage(pkg);
        setPurchaseModalVisible(true);
    };

    const handlePurchaseConfirm = async () => {
        if (!selectedPackage) return;

        setPurchasing(true);
        try {
            const res = await servicePackageApi.purchasePackage(selectedPackage.id);

            if (res?.paymentUrl) {
                window.location.href = res.paymentUrl; // Redirect sang VNPAY
                return; // Dừng các xử lý tiếp theo
            } else {
                toast.error("Không thể lấy URL thanh toán VNPAY");
            }
        } catch (error) {
            console.error("Error purchasing package:", error);
            const code = error.response?.data?.code;
            let message = ERROR_MESSAGES_VN[code] || "Mua gói thất bại"
            toast.error(message);
        } finally {
            setPurchasing(false);
        }
    };

    const handleAddProductToPromotion = async () => {
        if (!selectedProduct) {
            toast.error("Vui lòng chọn sản phẩm");
            return;
        }

        try {
            const res = await servicePackageApi.addProductToPromotion(selectedProduct);
            // res is the success message string from backend
            if (res && res.includes("đã được thêm")) {
                toast.success(res);
                // Update promoted list locally
                setPromotedProductIds(prev => [...prev, selectedProduct]);
            } else {
                toast.success(res);
                setPromotedProductIds(prev => [...prev, selectedProduct]);
            }
            setPromotionModalVisible(false);
            setSelectedProduct(null);
            setPromotionModalVisible(false);
            setSelectedProduct(null);
            await fetchData(false); // Refresh packages silently to update remaining usage
        } catch (error) {
            console.error("Error adding product to promotion:", error);
            toast.error(error.response?.data?.message || "Thêm sản phẩm thất bại");
        }
    };

    const getStatusTag = (status, endDate) => {
        const now = new Date();
        const end = new Date(endDate);

        if (status === "Active" && end > now) {
            return <Tag color="green">Đang hoạt động</Tag>;
        } else {
            return <Tag color="red">Đã hết hạn</Tag>;
        }
    };

    const hasActivePromotionPackage = () => {
        return myPackages.some(
            (pkg) =>
                pkg.status === "Active" &&
                (pkg.packageName?.includes("Quảng Cáo Sản Phẩm") || pkg.packageName?.includes("Content Extra"))
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    const tabItems = [
        {
            key: 'available',
            label: 'Gói Có Sẵn',
            children: (
                <Row gutter={[16, 16]}>
                    {availablePackages.map((pkg) => (
                        <Col xs={24} sm={12} lg={8} key={pkg.id}>
                            <Card
                                className="seller-stat-card"
                                style={{ height: "100%" }}
                                hoverable
                            >
                                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                                    {getPackageIcon(pkg.type)}
                                </div>
                                <h3 style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold" }}>
                                    {pkg.name}
                                </h3>
                                <Tag color="blue" style={{ marginBottom: "12px" }}>
                                    {pkg.type}
                                </Tag>
                                <p style={{ color: "#666", minHeight: "60px" }}>
                                    {pkg.description}
                                </p>
                                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                                    <div style={{ fontSize: "28px", fontWeight: "bold", color: "#008ECC" }}>
                                        {formatPrice(pkg.price)}
                                    </div>
                                    <div style={{ color: "#666", marginTop: "8px" }}>
                                        <ClockCircleOutlined /> {pkg.durationDays} ngày
                                    </div>
                                    {pkg.usageLimit && (
                                        <div style={{ color: "#666", marginTop: "4px" }}>
                                            Giới hạn: {pkg.usageLimit} lượt
                                        </div>
                                    )}
                                </div>

                                {!isPackageActive(pkg.id) ? (
                                    <Button
                                        type="primary"
                                        block
                                        icon={<ShoppingCartOutlined />}
                                        onClick={() => handlePurchaseClick(pkg)}
                                        style={{ backgroundColor: "#008ECC", borderColor: "#008ECC", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        Mua Ngay
                                    </Button>
                                ) : (
                                    <Button
                                        block
                                        disabled
                                        style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9", color: "rgba(0, 0, 0, 0.25)", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        Đang sử dụng
                                    </Button>
                                )}
                            </Card>
                        </Col>
                    ))
                    }
                </Row >
            )
        },
        {
            key: 'my-packages',
            label: 'Gói Của Tôi',
            children: (
                <>
                    {myPackages.length === 0 ? (
                        <Empty description="Bạn chưa mua gói dịch vụ nào" />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {myPackages.map((pkg) => (
                                <Col xs={24} lg={12} key={pkg.id}>
                                    <Card className="seller-stat-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                            <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
                                                {pkg.packageName}
                                            </h3>
                                            {getStatusTag(pkg.status, pkg.endDate)}
                                        </div>
                                        <div style={{ color: "#666" }}>
                                            <p>
                                                <strong>Ngày bắt đầu:</strong> {formatDate(pkg.startDate)}
                                            </p>
                                            <p>
                                                <strong>Ngày kết thúc:</strong> {formatDate(pkg.endDate)}
                                            </p>
                                            {pkg.remainingUsage !== null && (
                                                <p>
                                                    <strong>Lượt sử dụng còn lại:</strong> {pkg.remainingUsage}
                                                </p>
                                            )}
                                        </div>
                                        {pkg.status === "Active" &&
                                            (pkg.packageName?.includes("Gói Quảng Cáo Sản Phẩm") ||
                                                pkg.packageName?.includes("Content Extra")) && (
                                                <Button
                                                    type="primary"
                                                    block
                                                    onClick={() => setPromotionModalVisible(true)}
                                                    style={{ marginTop: "12px", backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                                                >
                                                    Thêm Sản Phẩm Quảng Cáo
                                                </Button>
                                            )}
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )
        }
    ];

    return (
        <div className="seller-content">
            <div style={{ marginBottom: "24px" }}>
                <h1 className="seller-page-title">Gói Dịch Vụ</h1>
                <p className="seller-page-description">
                    Mua gói dịch vụ để tăng hiệu quả kinh doanh
                </p>
            </div>

            <Tabs defaultActiveKey="available" items={tabItems} />

            {/* Purchase Confirmation Modal */}
            <Modal
                title="Xác Nhận Mua Gói"
                open={purchaseModalVisible}
                onOk={handlePurchaseConfirm}
                onCancel={() => setPurchaseModalVisible(false)}
                confirmLoading={purchasing}
                okText="Xác Nhận Mua"
                cancelText="Hủy"
            >
                {selectedPackage && (
                    <div>
                        <h3>{selectedPackage.name}</h3>
                        <p>{selectedPackage.description}</p>
                        <div style={{ marginTop: "16px" }}>
                            <p>
                                <strong>Giá:</strong> {formatPrice(selectedPackage.price)}
                            </p>
                            <p>
                                <strong>Thời hạn:</strong> {selectedPackage.durationDays} ngày
                            </p>
                            {selectedPackage.usageLimit && (
                                <p>
                                    <strong>Giới hạn sử dụng:</strong> {selectedPackage.usageLimit} lượt
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Product Promotion Modal */}
            <Modal
                title="Thêm Sản Phẩm Vào Quảng Cáo Tăng Cường"
                open={promotionModalVisible}
                onOk={handleAddProductToPromotion}
                onCancel={() => {
                    setPromotionModalVisible(false);
                    setSelectedProduct(null);
                }}
                okText="Thêm Sản Phẩm"
                cancelText="Hủy"
            >
                <p style={{ marginBottom: "16px" }}>
                    Chọn sản phẩm để thêm vào quảng cáo tăng cường:
                </p>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn sản phẩm"
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    showSearch
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.trim().toLowerCase())
                    }
                >
                    {products
                        .filter(p => p.productStatus === 'Approved')
                        .filter(p => !promotedProductIds.includes(p.productId || p.product_id || p.id))
                        .map((product) => (
                            <Option
                                key={product.productId || product.product_id || product.id}
                                value={product.productId || product.product_id || product.id}
                            >
                                {product.name}
                            </Option>
                        ))}
                </Select>
            </Modal>
        </div>
    );
}

