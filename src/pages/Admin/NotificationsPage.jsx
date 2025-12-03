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
  Select,
  Tag,
  Space
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SendOutlined, EyeOutlined } from "@ant-design/icons";
import notificationApi from "../../api/communication/NotificationApi";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import "../../styles/NotificationsPage.css";

const typeOptions = ["Promotion", "FlashSale", "System"];
const targetOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Người bán", value: "seller" },
  { label: "Người mua", value: "buyer" },
  { label: "Người dùng cụ thể", value: "user" },
];

export default function NotificationPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendingRecord, setSendingRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isRecipientsModalVisible, setIsRecipientsModalVisible] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const [form] = Form.useForm();
  const [sendForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // User search states
  const [selectedTarget, setSelectedTarget] = useState("all");
  const [userSearchText, setUserSearchText] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      const notificationsData = (res.data || []).map(n => ({
        ...n,
        createdAt: n.createdAt
          ? dayjs(n.createdAt).format("YYYY-MM-DD HH:mm")
          : "",
        updatedAt: n.updatedAt
          ? dayjs(n.updatedAt).format("YYYY-MM-DD HH:mm")
          : "",
        sentAt: n.sentAt
          ? dayjs(n.sentAt).format("YYYY-MM-DD HH:mm")
          : null,
        recipientCount: n.recipientCount || 0,
      }));

      notificationsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setList(notificationsData);
    } catch {
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      title: record.title,
      message: record.message,
      type: record.type
    });
    setIsModalOpen(true);
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      await notificationApi.delete(deletingRecord.id);
      setList(prev => prev.filter(item => item.id !== deletingRecord.id));
      toast.success("Đã xóa thông báo!");
    } catch {
      toast.error("Không thể xóa thông báo");
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeletingRecord(null);
  };

  const handleViewRecipients = async (record) => {
    setIsRecipientsModalVisible(true);
    setLoadingRecipients(true);
    try {
      const res = await notificationApi.getRecipients(record.id);
      setRecipients(res.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách người nhận");
      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        // Update
        await notificationApi.update(editingId, {
          title: values.title,
          message: values.message,
          type: values.type
        });

        toast.success("Đã cập nhật thông báo!");
        fetchData();

      } else {
        // Create mới
        const payload = {
          title: values.title,
          message: values.message,
          type: values.type,
          target: "all"
        };

        const res = await notificationApi.create(payload);

        const created = res?.data
          ? {
            ...res.data,
            createdAt: res.data.createdAt
              ? dayjs(res.data.createdAt).format("YYYY-MM-DD HH:mm")
              : dayjs().format("YYYY-MM-DD HH:mm"),
            updatedAt: res.data.updatedAt
              ? dayjs(res.data.updatedAt).format("YYYY-MM-DD HH:mm")
              : dayjs().format("YYYY-MM-DD HH:mm"),
          }
          : {
            id: Date.now(),
            ...payload,
            createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
            updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
          };

        setList(prev => [created, ...prev]);
        toast.success("Đã thêm thông báo!");
      }

      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();

    } catch {
      toast.error("Không thể lưu thông báo");
    }
  };

  const handleOpenSendModal = (record) => {
    setSendingRecord(record);
    sendForm.resetFields();
    sendForm.setFieldsValue({ target: "all" });
    setSelectedTarget("all");
    setUserSearchText("");
    setSelectedUsers([]);
    setUserOptions([]);
    setIsSendModalOpen(true);
  };

  const handleTargetChange = (value) => {
    setSelectedTarget(value);
    setUserSearchText("");
    setSelectedUsers([]);
    setUserOptions([]);
  };

  const handleUserSearch = async (value) => {
    setUserSearchText(value);
    if (!value || value.trim().length < 2) {
      setUserOptions([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const res = await notificationApi.searchUsers(value);
      const users = res.data || [];
      setUserOptions(users.map(u => ({
        value: u.id.toString(),
        label: `${u.username} (${u.email}) - ${u.role}`,
        user: u
      })));
    } catch (error) {
      console.error("Error searching users:", error);
      setUserOptions([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleUsersChange = (selectedIds) => {
    const users = userOptions
      .filter(opt => selectedIds.includes(opt.value))
      .map(opt => opt.user);
    setSelectedUsers(users);
  };

  const handleSendNotification = async () => {
    try {
      const values = await sendForm.validateFields();
      let targetValue = values.target.toUpperCase();
      let targetLabel = targetOptions.find(t => t.value === values.target)?.label || "tất cả";

      // If user-specific, use selected user IDs
      if (values.target === "user") {
        if (!selectedUsers || selectedUsers.length === 0) {
          toast.error("Vui lòng chọn ít nhất một người dùng");
          return;
        }
        // Send to each user individually
        const usernames = selectedUsers.map(u => u.username).join(", ");
        targetLabel = `${selectedUsers.length} người dùng (${usernames})`;

        // Send notification to each selected user
        for (const user of selectedUsers) {
          await notificationApi.sendNotification(
            sendingRecord.id,
            user.id.toString()
          );
        }

        toast.success(
          `Đã gửi thông báo "${sendingRecord.title}" đến ${targetLabel}!`
        );

        // Reload data
        await fetchData();

        setIsSendModalOpen(false);
        setSendingRecord(null);
        sendForm.resetFields();
        setSelectedUsers([]);
        setUserSearchText("");
        return;
      }

      await notificationApi.sendNotification(
        sendingRecord.id,
        targetValue
      );

      toast.success(
        `Đã gửi thông báo "${sendingRecord.title}" đến ${targetLabel}!`
      );

      // Reload data to get updated sentAt
      await fetchData();

      setIsSendModalOpen(false);
      setSendingRecord(null);
      sendForm.resetFields();
      setSelectedUsers([]);
      setUserSearchText("");

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi thông báo";
      toast.error(errorMessage);
    }
  };

  const filteredData = list.filter(item =>
    item.title?.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Nội dung", dataIndex: "message", key: "message" },
    { title: "Loại", dataIndex: "type", key: "type", render: t => <Tag color="blue">{t}</Tag> },
    {
      title: "Trạng thái",
      dataIndex: "sentAt",
      key: "sentAt",
      render: (sentAt, record) => {
        if (sentAt) {
          return (
            <div>
              <Tag color="green">Đã gửi</Tag>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                {record.recipientCount || 0} người đã nhận
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>
                {sentAt}
              </div>
            </div>
          );
        }
        return <Tag color="default">Chưa gửi</Tag>;
      }
    },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt" },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            size="small"
            onClick={() => handleOpenSendModal(record)}
            disabled={!!record.sentAt}
            style={{ width: 90, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {record.sentAt ? "Đã gửi" : "Gửi"}
          </Button>
          {record.recipientCount > 0 && (
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewRecipients(record)}
              title="Xem người nhận"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            />
          )}
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => showDeleteModal(record)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý thông báo"
        extra={
          <Button type="default" icon={<PlusOutlined />} onClick={handleCreate} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Thêm thông báo
          </Button>
        }
        style={{ borderRadius: 8 }}
      >
        <Row gutter={16} className="mb-4">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo tiêu đề..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ borderRadius: 6 }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: total => `Tổng ${total} mục` }}
          bordered={false}
          style={{ borderRadius: 8 }}
        />
      </Card >

      {/* Modal thêm / sửa */}
      < Modal
        title={editingId ? "Cập nhật thông báo" : "Thêm thông báo"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingId ? "Cập nhật" : "Xác nhận"}
        cancelText="Hủy"
        width={600}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select
              placeholder="Chọn loại"
              options={typeOptions.map(t => ({ label: t, value: t }))}
            />
          </Form.Item>
        </Form>
      </Modal >

      {/* Modal gửi */}
      < Modal
        title="Gửi thông báo"
        open={isSendModalOpen}
        onOk={handleSendNotification}
        onCancel={() => {
          setIsSendModalOpen(false);
          setSendingRecord(null);
          sendForm.resetFields();
          setSelectedUsers([]);
          setUserSearchText("");
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        width={500}
      >
        <Form layout="vertical" form={sendForm}>
          <Form.Item
            name="target"
            label="Gửi đến"
            rules={[{ required: true, message: "Vui lòng chọn đối tượng" }]}
            initialValue="all"
          >
            <Select
              placeholder="Chọn đối tượng nhận thông báo"
              options={targetOptions}
              style={{ width: "100%" }}
              onChange={handleTargetChange}
            />
          </Form.Item>

          {selectedTarget === "user" && (
            <Form.Item
              label="Tìm kiếm và chọn người dùng"
              rules={[{ required: true, message: "Vui lòng chọn ít nhất một người dùng" }]}
            >
              <Select
                mode="multiple"
                placeholder="Nhập tên hoặc email để tìm kiếm..."
                value={selectedUsers.map(u => u.id.toString())}
                onChange={handleUsersChange}
                onSearch={handleUserSearch}
                filterOption={false}
                options={userOptions}
                loading={searchingUsers}
                style={{ width: "100%" }}
                notFoundContent={searchingUsers ? "Đang tìm kiếm..." : "Nhập ít nhất 2 ký tự để tìm kiếm"}
              />
              {selectedUsers.length > 0 && (
                <div style={{ marginTop: 8, padding: 8, background: "#f0f0f0", borderRadius: 4 }}>
                  <strong>Đã chọn {selectedUsers.length} người:</strong>
                  <div style={{ marginTop: 4 }}>
                    {selectedUsers.map((u, idx) => (
                      <div key={u.id} style={{ fontSize: 12, color: "#666" }}>
                        {idx + 1}. {u.username} ({u.email})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Form.Item>
          )}

          {selectedTarget !== "all" && selectedTarget !== "user" && sendingRecord?.recipientCount > 0 && (
            <div style={{ padding: 12, background: "#fff7e6", border: "1px solid #ffd666", borderRadius: 4, marginTop: 8 }}>
              <strong>Cảnh báo:</strong> Thông báo này đã gửi cho {sendingRecord.recipientCount} người cụ thể.
              Nếu gửi cho nhóm, những người đã nhận sẽ không nhận lại (tránh spam).
            </div>
          )}

          {selectedTarget !== "all" && selectedTarget !== "user" && (
            <div style={{ padding: 12, background: "#fff7e6", border: "1px solid #ffd666", borderRadius: 4, marginTop: 8 }}>
              <strong>Lưu ý:</strong> Email sẽ KHÔNG được gửi cho nhóm người dùng. Chỉ gửi email khi chọn "Người dùng cụ thể".
            </div>
          )}

          {selectedTarget === "user" && (
            <div style={{ padding: 12, background: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: 4, marginTop: 8 }}>
              <strong>Lưu ý:</strong> Email sẽ được gửi đến người dùng đã chọn.
            </div>
          )}
        </Form>
      </Modal >

      {/* Modal xóa */}
      < Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {deletingRecord && (
          <p>Bạn có chắc chắn muốn xóa thông báo "{deletingRecord.title}" không?</p>
        )}
      </Modal >

      {/* Modal xem người nhận */}
      < Modal
        title="Danh sách người đã nhận thông báo"
        open={isRecipientsModalVisible}
        onCancel={() => setIsRecipientsModalVisible(false)}
        footer={
          [
            <Button key="close" onClick={() => setIsRecipientsModalVisible(false)}>
              Đóng
            </Button>
          ]}
        width={600}
      >
        {
          loadingRecipients ? (
            <div style={{ textAlign: 'center', padding: 20 }} > Đang tải...</div >
          ) : recipients.length > 0 ? (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <p><strong>Tổng số: {recipients.length} người</strong></p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recipients.map((recipient, index) => (
                  <li key={index} style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: 14
                  }}>
                    {index + 1}. {recipient}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Chưa có người nhận nào.</p>
          )}
      </Modal >
    </div >
  );
}
