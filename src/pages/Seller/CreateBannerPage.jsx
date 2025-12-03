import { useState, useEffect } from "react";
import {
    Card,
    Form,
    Input,
    Button,
    DatePicker,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import sellerBannerApi from "../../api/seller/sellerBannerApi";
import mediaApi from "../../api/identity/mediaApi";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import "../../styles/SellerLayout.css";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function CreateBannerPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchBannerDetail();
        }
    }, [id]);

    const fetchBannerDetail = async () => {
        try {
            const banner = await sellerBannerApi.getBannerById(id);
            form.setFieldsValue({
                title: banner.title,
                description: banner.description,
                dateRange: [dayjs(banner.startDate), dayjs(banner.endDate)],
            });
            setImageUrl(banner.imageUrl);
            form.setFieldValue("imageUrl", banner.imageUrl);
        } catch (error) {
            console.error("Error fetching banner detail:", error);
            toast.error("Không thể tải chi tiết banner");
            navigate("/seller/banners");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh!");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const res = await mediaApi.uploadMultiple(formData);

            if (res.data && res.data.length > 0) {
                const uploadedImage = res.data[0];
                setImageUrl(uploadedImage.url);
                form.setFieldValue("imageUrl", uploadedImage.url);
                toast.success("Tải ảnh lên thành công!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Tải ảnh lên thất bại!");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const [startDate, endDate] = values.dateRange;

            const bannerData = {
                title: values.title?.trim(),
                description: values.description?.trim(),
                imageUrl: imageUrl,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                position: 0,
                priority: 0,
            };

            if (isEditMode) {
                await sellerBannerApi.updateBanner(id, bannerData);
                toast.success("Cập nhật banner thành công");
            } else {
                await sellerBannerApi.createBanner(bannerData);
                toast.success("Tạo banner thành công! Đang chờ admin duyệt.");
            }

            navigate("/seller/banners");
        } catch (error) {
            console.error("Error saving banner:", error);
            const errorMsg =
                error.response?.data?.message || "Không thể lưu banner";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-content">
            <div style={{ marginBottom: "24px" }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/seller/banners")}
                    style={{ marginBottom: "16px", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    Quay lại
                </Button>
                <h1 className="seller-page-title">
                    {isEditMode ? "Chỉnh Sửa Banner" : "Tạo Banner Mới"}
                </h1>
                <p className="seller-page-description">
                    {isEditMode
                        ? "Cập nhật thông tin banner quảng cáo"
                        : "Tạo banner quảng cáo cho sản phẩm của bạn"}
                </p>
            </div>

            <Card className="seller-table">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >


                    <Form.Item
                        name="title"
                        label="Tiêu đề banner"
                        rules={[
                            { required: true, message: "Vui lòng nhập tiêu đề" },
                            { max: 100, message: "Tiêu đề không quá 100 ký tự" },
                            {
                                validator: (_, value) => {
                                    if (value && value.trim() === "") {
                                        return Promise.reject("Tiêu đề không được chỉ chứa khoảng trắng");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        normalize={(value) => value?.trimStart()}
                    >
                        <Input placeholder="Nhập tiêu đề banner" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: 500, message: "Mô tả không quá 500 ký tự" },
                            {
                                validator: (_, value) => {
                                    if (value && value.trim() === "") {
                                        return Promise.reject("Mô tả không được chỉ chứa khoảng trắng");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        normalize={(value) => value?.trimStart()}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết về banner"
                        />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="Hình ảnh banner"
                        rules={[{ required: true, message: "Vui lòng tải lên hình ảnh" }]}
                    >
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                                id="banner-image-upload"
                                disabled={uploading}
                            />
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploading}
                                onClick={() =>
                                    document.getElementById("banner-image-upload").click()
                                }
                                style={{ marginBottom: "8px", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                            </Button>
                            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
                                Định dạng: PNG, JPG, WebP (tối đa 5MB)
                            </p>
                        </div>
                    </Form.Item>

                    {imageUrl && (
                        <div style={{ marginBottom: "16px" }}>
                            <img
                                src={imageUrl}
                                alt="Banner preview"
                                style={{
                                    width: "100%",
                                    maxWidth: "600px",
                                    height: "auto",
                                    borderRadius: "8px",
                                    border: "1px solid #d9d9d9",
                                }}
                            />
                        </div>
                    )}

                    <Form.Item
                        name="dateRange"
                        label="Thời gian hiển thị"
                        rules={[
                            { required: true, message: "Vui lòng chọn thời gian hiển thị" },
                        ]}
                    >
                        <RangePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: "100%" }}
                            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                        />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ backgroundColor: "#008ECC", borderColor: "#008ECC" }}
                            >
                                {isEditMode ? "Cập nhật" : "Tạo banner"}
                            </Button>
                            <Button onClick={() => navigate("/seller/banners")}>Hủy</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
