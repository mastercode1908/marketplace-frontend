import { useState } from 'react';
import { Card, Button, Modal, Form, Input, Radio, Row, Col } from 'antd';
import {
    CheckOutlined,
    CrownOutlined,
    RocketOutlined,
    StarOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { toast } from "react-hot-toast";
import servicePackageApi from '../../api/seller/servicePackageApi';
import { useEffect } from 'react';
import '../../styles/SellerServicePackagePage.css';

export default function SellerServicePackagePage() {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState('credit_card');

    const [packages, setPackages] = useState([]);
    const [myPackages, setMyPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [availableRes, myRes] = await Promise.all([
                    servicePackageApi.getAvailablePackages(),
                    servicePackageApi.getMyPackages()
                ]);

                const availableList = availableRes.content || [];
                const myList = myRes || [];

                setMyPackages(myList);

                // Map API data to UI structure
                const mappedPackages = availableList.map(pkg => {
                    let uiProps = {
                        icon: <StarOutlined />,
                        color: '#008ECC',
                        popular: false,
                        badge: null,
                        features: []
                    };

                    // Customize based on package name or type
                    if (pkg.name.toLowerCase().includes('basic')) {
                        uiProps.icon = <StarOutlined />;
                        uiProps.color = '#008ECC';
                    } else if (pkg.name.toLowerCase().includes('professional') || pkg.name.toLowerCase().includes('pro')) {
                        uiProps.icon = <CrownOutlined />;
                        uiProps.popular = true;
                        uiProps.badge = 'PHỔ BIẾN NHẤT';
                    } else if (pkg.name.toLowerCase().includes('enterprise') || pkg.name.toLowerCase().includes('vip')) {
                        uiProps.icon = <RocketOutlined />;
                        uiProps.badge = 'TỐT NHẤT';
                    } else if (pkg.name.toLowerCase().includes('banner')) {
                        uiProps.icon = <RocketOutlined />;
                    }

                    // Parse description to features
                    if (pkg.description) {
                        uiProps.features = pkg.description.split('\n').map(line => ({
                            text: line.trim(),
                            included: true // Assume all listed features are included
                        }));
                    }

                    return {
                        ...pkg,
                        ...uiProps,
                        duration: pkg.durationDays ? `${pkg.durationDays} ngày` : 'tháng'
                    };
                });

                setPackages(mappedPackages);
            } catch (error) {
                console.error("Error fetching packages:", error);
                toast.error("Không thể tải danh sách gói dịch vụ");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const isPackageActive = (pkgId) => {
        return myPackages.some(p => p.packageId === pkgId && p.status === 'Active');
    };

    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            // Call API to purchase
            const res = await servicePackageApi.purchasePackage(selectedPackage.id);

            // If it returns a payment URL (VNPay), redirect
            if (res && res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                toast.success(`Đã đăng ký gói ${selectedPackage.name} thành công!`);
                setIsModalVisible(false);
                form.resetFields();
                // Refresh data
                const myRes = await servicePackageApi.getMyPackages();
                setMyPackages(myRes || []);
            }
        } catch (err) {
            toast.error('Không thể đăng ký gói dịch vụ. Vui lòng thử lại!');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <div className="seller-content">
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <h1 className="seller-page-title">Gói Dịch Vụ</h1>
                <p className="seller-page-description">
                    Chọn gói dịch vụ phù hợp để phát triển doanh nghiệp của bạn
                </p>
            </div>

            {/* Packages Grid */}
            <Row gutter={[24, 24]}>
                {packages.map((pkg) => (
                    <Col xs={24} md={8} key={pkg.id}>
                        <div className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                            {pkg.badge && (
                                <div className="package-badge">
                                    {pkg.badge}
                                </div>
                            )}

                            <Card className="package-card-inner">
                                <div className="package-icon" style={{ backgroundColor: pkg.color }}>
                                    {pkg.icon}
                                </div>

                                <h2 className="package-name">{pkg.name}</h2>

                                <div className="package-price">
                                    <span className="price-amount">{pkg.price.toLocaleString('vi-VN')}</span>
                                    <span className="price-currency">đ</span>
                                    <span className="price-duration">/{pkg.duration}</span>
                                </div>

                                <div className="package-features">
                                    {pkg.features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`feature-item ${feature.included ? 'included' : 'not-included'}`}
                                        >
                                            <span className="feature-icon">
                                                {feature.included ? <CheckOutlined /> : '×'}
                                            </span>
                                            <span className="feature-text">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {!isPackageActive(pkg.id) ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="package-button seller-btn-primary"
                                        onClick={() => handleSelectPackage(pkg)}
                                    >
                                        Chọn Gói {pkg.name}
                                    </Button>
                                ) : (
                                    <Button
                                        size="large"
                                        className="package-button"
                                        disabled
                                        style={{ background: '#f0f0f0', borderColor: '#d9d9d9', color: 'rgba(0, 0, 0, 0.25)' }}
                                    >
                                        Đang sử dụng
                                    </Button>
                                )}
                            </Card>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Purchase Modal */}
            <Modal
                title={
                    <div className="modal-header">
                        <span className="modal-icon" style={{ backgroundColor: '#008ECC' }}>
                            {selectedPackage?.icon}
                        </span>
                        <div>
                            <h3>Đăng ký gói {selectedPackage?.name}</h3>
                            <p className="modal-price">
                                {selectedPackage?.price.toLocaleString('vi-VN')}đ/{selectedPackage?.duration}
                            </p>
                        </div>
                    </div>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Xác Nhận Thanh Toán"
                cancelText="Hủy"
                width={600}
                okButtonProps={{ className: 'seller-btn-primary' }}
            >
                <Form form={form} layout="vertical" className="purchase-form">
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nguyễn Văn A" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="example@email.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input placeholder="0123456789" size="large" />
                    </Form.Item>

                    <Form.Item label="Phương thức thanh toán">
                        <Radio.Group
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="payment-methods"
                        >
                            <Radio.Button value="credit_card" className="payment-option">
                                💳 Thẻ tín dụng
                            </Radio.Button>
                            <Radio.Button value="bank_transfer" className="payment-option">
                                🏦 Chuyển khoản
                            </Radio.Button>
                            <Radio.Button value="momo" className="payment-option">
                                📱 MoMo
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <div className="payment-summary">
                        <div className="summary-row">
                            <span>Gói dịch vụ:</span>
                            <strong>{selectedPackage?.name}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Thời hạn:</span>
                            <strong>1 {selectedPackage?.duration}</strong>
                        </div>
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <strong className="total-amount">
                                {selectedPackage?.price.toLocaleString('vi-VN')}đ
                            </strong>
                        </div>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
