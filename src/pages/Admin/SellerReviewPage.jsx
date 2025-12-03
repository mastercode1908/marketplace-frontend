/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Descriptions,
  Drawer,
  message,
  Tabs,
} from "antd";
import { toast } from "react-hot-toast";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import userManageApi from "../../api/identity/UserManageApi";

const { TextArea } = Input;

export default function SellerReviewPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [activeTab, setActiveTab] = useState("Reviewing");
  const [form] = Form.useForm();

  const fetchSellers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const status = activeTab === "ALL" ? null : activeTab;
      const res = await userManageApi.getSellers({
        page: page - 1,
        size: pageSize,
        status: status,
      });
      setSellers(res.data.content || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: res.data.totalElements || 0,
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [activeTab]);

  const handleApprove = async (sellerId) => {
    try {
      await userManageApi.approveSeller(sellerId);
      toast.success("Đã duyệt seller thành công!");
      fetchSellers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      toast.error("Không thể duyệt seller");
    }
  };

  const showRejectModal = (seller) => {
    setSelectedSeller(seller);
    form.resetFields();
    setIsRejectModalVisible(true);
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await userManageApi.rejectSeller(selectedSeller.sellerId, values.note);
      toast.success("Đã từ chối seller và gửi email thông báo!");
      setIsRejectModalVisible(false);
      setSelectedSeller(null);
      form.resetFields();
      setSelectedSeller(null);
      form.resetFields();
      fetchSellers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      toast.error("Không thể từ chối seller");
    }
  };

  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
    setSelectedSeller(null);
    form.resetFields();
  };

  const showDetail = (seller) => {
    setSelectedSeller(seller);
    setIsDetailDrawerVisible(true);
  };

  const handleTableChange = (newPagination) => {
    fetchSellers(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "sellerId",
      key: "sellerId",
      width: 80,
    },
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "shopName",
      key: "shopName",
      render: (text) => text || "-",
    },
    {
      title: "Mã số thuế",
      dataIndex: "taxCode",
      key: "taxCode",
      render: (text) => text || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "userStatus",
      key: "userStatus",
      render: (status) => (
        <Tag color="orange">Đang xét duyệt</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Chi tiết
          </Button>

          {activeTab === "Reviewing" && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.sellerId)}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <h2 className="text-xl font-bold mb-4">Xét duyệt đăng ký Seller</h2>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "ALL", label: "Tất Cả" },
            { key: "Reviewing", label: "Chờ Duyệt" },
            { key: "Active", label: "Đã Duyệt" },
            { key: "Incomplete", label: "Bị Từ Chối" },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={columns}
          dataSource={sellers}
          rowKey="sellerId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal từ chối */}
      <Modal
        title="Từ chối đăng ký Seller"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={handleRejectCancel}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ghi chú từ chối"
            name="note"
            rules={[
              { required: true, message: "Vui lòng nhập ghi chú từ chối" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ví dụ: Chưa điền đầy đủ form, vui lòng điền lại..."
            />
          </Form.Item>
          {selectedSeller && (
            <div className="text-sm text-gray-500 mt-2">
              <p>
                <strong>Seller:</strong> {selectedSeller.username}
              </p>
              <p>
                <strong>Cửa hàng:</strong> {selectedSeller.shopName || "Chưa có"}
              </p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Drawer chi tiết */}
      <Drawer
        title="Chi tiết Seller"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={600}
      >
        {selectedSeller && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedSeller.sellerId}</Descriptions.Item>
            <Descriptions.Item label="Tên người dùng">
              {selectedSeller.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedSeller.email}
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {selectedSeller.fullName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedSeller.phone || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên cửa hàng">
              {selectedSeller.shopName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ cửa hàng">
              {selectedSeller.shopAddress || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả cửa hàng">
              {selectedSeller.shopDescription || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã số thuế">
              {selectedSeller.taxCode || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="orange">Đang xét duyệt</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedSeller.createdAt
                ? new Date(selectedSeller.createdAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {selectedSeller.updatedAt
                ? new Date(selectedSeller.updatedAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

