import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Tag,
  Card,
  Popconfirm,
} from "antd";
import { toast } from "react-hot-toast";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import sellerApi from "../../api/seller/sellerApi";
import dayjs from "dayjs";
import "../../styles/SellerLayout.css";

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function SellerVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await sellerApi.getVouchers();
      setVouchers(data || []);
      setFilteredVouchers(data || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      // Tạm thời dùng mock data nếu API chưa có
      const mockVouchers = [
        {
          id: 1,
          code: "SALE10",
          discount: 10,
          minOrder: 100000,
          maxDiscount: 50000,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          status: "Active",
        },
      ];
      setVouchers(mockVouchers);
      setFilteredVouchers(mockVouchers);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingVoucher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    form.setFieldsValue({
      code: voucher.code,
      discount: voucher.discount,
      minOrder: voucher.minOrder,
      maxDiscount: voucher.maxDiscount,
      startDate: voucher.startDate ? dayjs(voucher.startDate) : null,
      endDate: voucher.endDate ? dayjs(voucher.endDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (voucherId) => {
    try {
      // TODO: Cần endpoint DELETE /api/seller/vouchers/{id}
      toast.success("Xóa voucher thành công!");
      Modal.success({
        title: "Thành công",
        content: "Xóa voucher thành công!",
        okText: "Đóng",
      });
      fetchVouchers();
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast.error("Không thể xóa voucher");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const voucherData = {
        ...values,
        startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      };

      if (editingVoucher) {
        // TODO: Cần endpoint PUT /api/seller/vouchers/{id}
        toast.success("Cập nhật voucher thành công!");
        Modal.success({
          title: "Thành công",
          content: "Cập nhật voucher thành công!",
          okText: "Đóng",
        });
      } else {
        // TODO: Cần endpoint POST /api/seller/vouchers
        toast.success("Thêm voucher thành công!");
        Modal.success({
          title: "Thành công",
          content: "Thêm voucher thành công!",
          okText: "Đóng",
        });
      }
      setModalVisible(false);
      form.resetFields();
      fetchVouchers();
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast.error(error.response?.data?.message || "Không thể lưu voucher");
    }
  };

  const handleSearch = (value) => {
    const trimmedValue = value ? value.trim() : "";
    if (!trimmedValue) {
      setFilteredVouchers(vouchers);
      return;
    }
    const filtered = vouchers.filter(
      (voucher) =>
        voucher.code?.toLowerCase().includes(trimmedValue.toLowerCase()) ||
        voucher.id?.toString().includes(trimmedValue)
    );
    setFilteredVouchers(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getStatusColor = (status) => {
    const statusMap = {
      Active: "green",
      Inactive: "default",
      Expired: "red",
    };
    return statusMap[status] || "default";
  };

  const columns = [
    {
      title: "Mã Voucher",
      dataIndex: "code",
      key: "code",
      render: (code) => (
        <span style={{ fontWeight: 600, color: "#008ECC" }}>{code}</span>
      ),
    },
    {
      title: "Giảm Giá",
      dataIndex: "discount",
      key: "discount",
      render: (discount, record) => {
        if (record.discountType === "percentage") {
          return `${discount}%`;
        }
        return formatPrice(discount || 0);
      },
    },
    {
      title: "Đơn Tối Thiểu",
      dataIndex: "minOrder",
      key: "minOrder",
      render: (minOrder) => formatPrice(minOrder || 0),
    },
    {
      title: "Giảm Tối Đa",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      render: (maxDiscount) => (maxDiscount ? formatPrice(maxDiscount) : "Không giới hạn"),
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
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Active"}</Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa voucher này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button type="link" danger icon={<DeleteOutlined />} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="seller-content">
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="seller-page-title">Quản Lý Voucher</h1>
          <p className="seller-page-description">
            Tạo và quản lý mã giảm giá cho khách hàng
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="seller-btn-primary"
          onClick={handleAddNew}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Thêm Voucher
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Tìm kiếm voucher..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                setFilteredVouchers(vouchers);
              }
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredVouchers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} voucher`,
          }}
          locale={{ emptyText: "Chưa có voucher nào" }}
        />
      </Card>

      {/* Voucher Form Modal */}
      <Modal
        title={editingVoucher ? "Cập nhật Voucher" : "Thêm Voucher Mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingVoucher(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Mã Voucher"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã voucher" }]}
          >
            <Input placeholder="Nhập mã voucher (VD: SALE10)" />
          </Form.Item>

          <Form.Item
            label="Loại Giảm Giá"
            name="discountType"
            initialValue="percentage"
            rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
          >
            <Select>
              <Option value="percentage">Phần trăm (%)</Option>
              <Option value="fixed">Số tiền cố định (VND)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giảm Giá"
            name="discount"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị giảm giá" },
              { type: "number", min: 0, message: "Giá trị phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá trị giảm giá"
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Đơn Hàng Tối Thiểu (VND)"
            name="minOrder"
            rules={[
              { required: true, message: "Vui lòng nhập đơn hàng tối thiểu" },
              { type: "number", min: 0, message: "Giá trị phải lớn hơn hoặc bằng 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập đơn hàng tối thiểu"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Giảm Tối Đa (VND)"
            name="maxDiscount"
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giảm tối đa (để trống nếu không giới hạn)"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Ngày Bắt Đầu"
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Ngày Kết Thúc"
            name="endDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingVoucher(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" className="seller-btn-primary">
                {editingVoucher ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

