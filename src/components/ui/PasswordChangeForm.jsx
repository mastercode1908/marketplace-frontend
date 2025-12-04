import { useState } from "react";
import { Form, Input, Button } from "antd";
import { toast } from "react-hot-toast";
import authApi from "../../api/identity/authApi";

export default function PasswordChangeFormComponent() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            await authApi.changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            });
            toast.success("Đổi mật khẩu thành công");
            // Reset form on success
            form.resetFields();
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
            // Keep form values on error so user can fix
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="content-title">Đổi Mật Khẩu</h1>
            <p className="content-description">Thay đổi mật khẩu của bạn</p>
            <div className="max-w-md">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="oldPassword"
                        rules={[
                            {
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value.trim() === "") {
                                        return Promise.reject(
                                            new Error("Mật khẩu không được chứa khoảng trắng")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                            {
                                required: true,
                                message: "Vui lòng nhập mật khẩu hiện tại",
                            },
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            {
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value.trim() === "") {
                                        return Promise.reject(
                                            new Error("Mật khẩu không được chứa khoảng trắng")
                                        );
                                    }
                                    if (value.length < 8) {
                                        return Promise.reject(
                                            new Error("Mật khẩu phải từ 8 ký tự trở lên")
                                        );
                                    }
                                    if (
                                        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.[\]{}\";,<>?/+_=\-]).*$/.test(
                                            value
                                        )
                                    ) {
                                        return Promise.reject(
                                            new Error(
                                                "Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                                            )
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                            {
                                required: true,
                                message: "Vui lòng nhập mật khẩu mới",
                            },
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            {
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value.trim() === "") {
                                        return Promise.reject(
                                            new Error("Mật khẩu không được chứa khoảng trắng")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                            {
                                required: true,
                                message: "Vui lòng xác nhận mật khẩu mới",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="bg-[#008ECC]"
                        >
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}
