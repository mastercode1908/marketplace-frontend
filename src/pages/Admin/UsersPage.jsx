/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Input,
  Modal,
  Form,
  Table,
  Space,
  Tooltip,
  Tag,
  Select,
  Drawer,
  Descriptions,
  Tabs,
} from "antd";
import { toast } from "react-hot-toast";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import userManageApi from "../../api/identity/UserManageApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userManageApi.getAll({
        username: searchText?.trim() || undefined,
        role: roleFilter || undefined,
        userStatus: statusFilter || undefined,
        page: 0,
        size: 1000, // Lấy tất cả users, có thể điều chỉnh sau nếu cần pagination
      });
      // Handle both Spring Page response format
      if (res.data && res.data.content) {
        setUsers(res.data.content || []);
      } else if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchText, roleFilter, statusFilter]);

  const showStatusModal = (record) => {
    setSelectedUser(record);
    form.setFieldsValue({ status: record.userStatus });
    setIsStatusModalVisible(true);
  };

  const handleStatusModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (selectedUser) {
        await userManageApi.updateStatus(selectedUser.id, values.status);
        toast.success("Cập nhật trạng thái thành công!");
        fetchUsers();
      }
      setIsStatusModalVisible(false);
      setSelectedUser(null);
      form.resetFields();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const showDeleteModal = (record) => {
    setSelectedUser(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await userManageApi.delete(selectedUser.id);
      toast.success("Xóa người dùng thành công!");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa người dùng");
    } finally {
      setIsDeleteModalVisible(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setSelectedUser(null);
  };

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const showDetail = async (record) => {
    try {
      const res = await userManageApi.getById(record.id);
      setSelectedUser(res.data);
      setIsDrawerVisible(true);
    } catch {
      toast.error("Không thể tải chi tiết người dùng");
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      Active: { color: "green", label: "Hoạt động" },
      Pending: { color: "orange", label: "Chờ phê duyệt" },
      Banned: { color: "red", label: "Bị cấm" },
      Inactive: { color: "gray", label: "Không hoạt động" },
      Incomplete: { color: "blue", label: "Chưa hoàn thành" },
      Reviewing: { color: "yellow", label: "Đang chờ xét duyệt" },
    };
    const config = statusConfig[status] || { color: "gray", label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getRoleTag = (role) => {
    const roleConfig = {
      BUYER: { color: "blue", label: "Người mua" },
      SELLER: { color: "purple", label: "Người bán" },
      ADMIN: { color: "red", label: "Admin" },
    };
    const config = roleConfig[role] || { color: "gray", label: role };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50 },
    { title: "Tên người dùng", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Vai trò", dataIndex: "role", key: "role", render: getRoleTag },
    {
      title: "Trạng thái",
      dataIndex: "userStatus",
      key: "userStatus",
      render: getStatusTag,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showStatusModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm username, email, số điện thoại"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Col>
          <Col>
            <Select
              placeholder="Vai trò"
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: "Người mua", value: "BUYER" },
                { label: "Người bán", value: "SELLER" },
                { label: "Admin", value: "ADMIN" },
              ]}
            />
          </Col>
          <Col>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: 150 }}
              options={[
                { label: "Hoạt động", value: "Active" },
                { label: "Chờ phê duyệt", value: "Pending" },
                { label: "Bị cấm", value: "Banned" },
                { label: "Không hoạt động", value: "Inactive" },
                { label: "Chưa hoàn thành", value: "Incomplete" },
                { label: "Đang chờ xét duyệt", value: "Reviewing" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table columns={columns} dataSource={users} rowKey="id" loading={loading} size="middle" />
      </Card>

      <Modal
        title="Cập nhật trạng thái"
        open={isStatusModalVisible}
        onOk={handleStatusModalOk}
        onCancel={handleStatusModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Hoạt động", value: "Active" },
                { label: "Chờ phê duyệt", value: "Pending" },
                { label: "Bị cấm", value: "Banned" },
                { label: "Không hoạt động", value: "Inactive" },
                { label: "Chưa hoàn thành", value: "Incomplete" },
                { label: "Đang chờ xét duyệt", value: "Reviewing" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {selectedUser && (
          <p>
            Bạn có chắc chắn muốn xóa người dùng "{selectedUser.username}"
            không?
          </p>
        )}
      </Modal>

      <Drawer
        title={selectedUser?.username}
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={500}
      >
        {selectedUser && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Thông tin cơ bản",
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="ID">
                      {selectedUser.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên">
                      {selectedUser.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedUser.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {selectedUser.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                      {getRoleTag(selectedUser.role)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      {getStatusTag(selectedUser.userStatus)}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "2",
                label: "Lịch sử",
                children: (
                  <div className="text-center text-gray-500 py-8">
                    Không có dữ liệu
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
}
