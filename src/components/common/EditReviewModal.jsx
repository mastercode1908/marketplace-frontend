import { Modal, Form, Input, Rate, Button } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { reviewApi } from "../../api/catalog/reviewApi";

export default function EditReviewModal({ isOpen, onClose, review, onReviewUpdated }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && review) {
            form.setFieldsValue({
                rating: review.rating,
                comment: review.comment,
            });
        }
    }, [isOpen, review, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                rating: values.rating,
                comment: values.comment,
                // Include other fields if required by backend, e.g. productId, buyerId
                // Based on ReviewRequest, backend might need them, but usually update only needs changed fields
                // We'll send what we have if needed, but let's try minimal first or check if we have data
                productId: review.productId,
                buyerId: review.buyerId || review.userId,
            };

            await reviewApi.updateReview(review.reviewId || review.id, payload);
            toast.success("Đã cập nhật đánh giá");
            onReviewUpdated();
            onClose();
        } catch (error) {
            console.error("Failed to update review", error);
            toast.error("Không thể cập nhật đánh giá");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa đánh giá"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="rating"
                    label="Đánh giá"
                    rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
                >
                    <Rate />
                </Form.Item>

                <Form.Item
                    name="comment"
                    label="Nhận xét"
                    rules={[{ required: true, message: "Vui lòng nhập nhận xét" }]}
                >
                    <Input.TextArea rows={4} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading} className="bg-[#008ECC]">
                        Cập nhật
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
