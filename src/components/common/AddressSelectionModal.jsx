import React, { useState, useEffect } from "react";
import { Modal, Radio, Button, Form, Input, Select, Checkbox, message, Spin } from "antd";
import { PlusOutlined, CheckCircleFilled } from "@ant-design/icons";
import userApi from "../../api/identity/UserProfileApi";
import { ShippingApi } from "../../api/shipping/ShippingApi";

const { Option } = Select;

const AddressSelectionModal = ({ isOpen, onClose, onSelectAddress, currentAddressId }) => {
    const [mode, setMode] = useState("list"); // "list" or "add"
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(currentAddressId);

    // Form states
    const [form] = Form.useForm();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
            setMode("list");
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedId(currentAddressId);
    }, [currentAddressId]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAddresses();
            // Ensure addresses is an array
            const addressList = Array.isArray(res) ? res : (res.data || []);
            setAddresses(addressList);

            // If no current selection, select default
            if (!currentAddressId) {
                const defaultAddr = addressList.find(a => a.isDefault);
                if (defaultAddr) setSelectedId(defaultAddr.id);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
            // message.error("Không thể tải danh sách địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (e) => {
        setSelectedId(e.target.value);
        const selectedAddr = addresses.find(a => a.id === e.target.value);
        if (selectedAddr) {
            onSelectAddress(selectedAddr);
            onClose();
        }
    };

    // --- Add Address Logic ---

    const handleAddNew = async () => {
        setMode("add");
        form.resetFields();
        try {
            const res = await ShippingApi.getProvinces();
            setProvinces(res.data || res);
        } catch (error) {
            console.error("Failed to fetch provinces:", error);
        }
    };

    const handleProvinceChange = async (value) => {
        form.setFieldsValue({ districtId: undefined, wardCode: undefined });
        setDistricts([]);
        setWards([]);
        try {
            const res = await ShippingApi.getDistricts(value);
            setDistricts(res.data || res);
        } catch (error) {
            console.error("Failed to fetch districts:", error);
        }
    };

    const handleDistrictChange = async (value) => {
        form.setFieldsValue({ wardCode: undefined });
        setWards([]);
        try {
            const res = await ShippingApi.getWards(value);
            setWards(res.data || res);
        } catch (error) {
            console.error("Failed to fetch wards:", error);
        }
    };

    const onFinishAdd = async (values) => {
        setSubmitting(true);
        try {
            const province = provinces.find(p => p.ProvinceID === values.provinceId);

            const payload = {
                receiverName: values.fullName,
                receiverPhone: values.phone,
                provinceName: province?.ProvinceName,
                districtId: values.districtId,
                wardCode: values.wardCode,
                addressDetail: values.addressDetail,
                isDefault: values.isDefault || false,
                // Assuming backend handles "type" (Home/Office) if needed, or we map it
                // The API createAddress might not take "type" based on UserProfileApi, but let's send it if supported
            };

            await userApi.createAddress(payload);
            message.success("Thêm địa chỉ thành công");
            await fetchAddresses();
            setMode("list");
        } catch (error) {
            console.error("Failed to create address:", error);
            message.error("Thêm địa chỉ thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render ---

    const renderList = () => (
        <div className="address-list-container">
            {loading ? (
                <div className="flex justify-center py-8"><Spin /></div>
            ) : (
                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedId === addr.id ? 'border-[#008ECC] bg-[#F0F9FF]' : 'border-gray-200 hover:border-[#008ECC]'}`}
                            onClick={() => {
                                setSelectedId(addr.id);
                                onSelectAddress(addr);
                                onClose();
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <Radio checked={selectedId === addr.id} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-800">{addr.receiverName}</span>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-gray-600">{addr.receiverPhone}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        {addr.addressDetail}
                                        {addr.wardName ? `, ${addr.wardName}` : ''}
                                        {addr.districtName ? `, ${addr.districtName}` : ''}
                                        {addr.provinceName ? `, ${addr.provinceName}` : ''}
                                    </div>
                                    {addr.isDefault && (
                                        <span className="inline-block px-2 py-0.5 border border-[#FF4D4F] text-[#FF4D4F] text-xs rounded">
                                            Mặc định
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {addresses.length === 0 && (
                        <div className="text-center text-gray-500 py-4">Chưa có địa chỉ nào</div>
                    )}
                </div>
            )}

            <button
                onClick={handleAddNew}
                className="w-full mt-4 py-3 border border-dashed border-[#008ECC] text-[#008ECC] rounded-lg flex items-center justify-center gap-2 hover:bg-[#F0F9FF] transition-colors"
            >
                <PlusOutlined /> Thêm địa chỉ
            </button>
        </div>
    );

    const renderAddForm = () => (
        <div className="add-address-form">
            <h3 className="text-lg font-semibold mb-4">Địa chỉ mới</h3>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinishAdd}
                initialValues={{ isDefault: false }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="fullName"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                        <Input placeholder="Họ và tên" className="py-2" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input placeholder="Số điện thoại" className="py-2" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="provinceId"
                    rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố" }]}
                >
                    <Select
                        placeholder="Tỉnh/ Thành phố"
                        onChange={handleProvinceChange}
                        showSearch
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {provinces.map(p => (
                            <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="districtId"
                        rules={[{ required: true, message: "Vui lòng chọn Quận/Huyện" }]}
                    >
                        <Select
                            placeholder="Quận/Huyện"
                            onChange={handleDistrictChange}
                            disabled={!districts.length}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {districts.map(d => (
                                <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="wardCode"
                        rules={[{ required: true, message: "Vui lòng chọn Phường/Xã" }]}
                    >
                        <Select
                            placeholder="Phường/Xã"
                            disabled={!wards.length}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {wards.map(w => (
                                <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="addressDetail"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
                >
                    <Input.TextArea placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" rows={2} />
                </Form.Item>



                <Form.Item name="isDefault" valuePropName="checked">
                    <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                </Form.Item>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => setMode("list")}>Trở Lại</Button>
                    <Button type="primary" htmlType="submit" loading={submitting} className="bg-[#FF4D4F] border-[#FF4D4F] hover:bg-[#ff7875] hover:border-[#ff7875]">
                        Hoàn thành
                    </Button>
                </div>
            </Form>
        </div>
    );

    return (
        <Modal
            title={mode === "list" ? "Địa chỉ nhận hàng" : "Thêm địa chỉ mới"}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            destroyOnClose
        >
            {mode === "list" ? renderList() : renderAddForm()}
        </Modal>
    );
};

export default AddressSelectionModal;
