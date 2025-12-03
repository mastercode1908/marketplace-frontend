"use client"

import { useState, useEffect } from "react"
import {
  Layout,
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
  message,
  Select,
} from "antd"
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import categoryApi from "../../api/catalog/categoryApi"

const { Content } = Layout

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [deletingRecord, setDeletingRecord] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")

  // Fetch categories từ backend
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryApi.getCategories()
      let categoriesData = Array.isArray(data) ? data : (data?.data ?? [])
      // Chỉ hiển thị những mục chưa bị xóa mềm
      const activeCategories = categoriesData.filter(cat => !cat.deletedAt && !cat.deleted)
      setCategories(activeCategories.reverse())
    } catch (error) {
      console.error("Error fetching categories:", error)
      message.error("Không thể tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    })
    setIsModalVisible(true)
  }

  const showDeleteModal = (record) => {
    setDeletingRecord(record)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteOk = async () => {
    try {
      await categoryApi.deleteCategory(deletingRecord.id)
      message.success("Đã xóa danh mục thành công!")
      await fetchCategories() // fetch lại danh sách để loại bỏ soft-deleted
    } catch (error) {
      console.error("Error deleting category:", error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa danh mục. Có thể danh mục này đang được sử dụng."
      message.error(errorMessage)
    } finally {
      setIsDeleteModalVisible(false)
      setDeletingRecord(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setDeletingRecord(null)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await categoryApi.updateCategory(editingId, values)
        message.success("Cập nhật danh mục thành công")
      } else {
        await categoryApi.createCategory(values)
        message.success("Thêm danh mục thành công")
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingId(null)
      await fetchCategories() // fetch lại danh sách để cập nhật state
    } catch (error) {
      console.error("Error saving category:", error)
      const errorMessage =
        error.response?.data?.message || error.message || "Không thể lưu danh mục"
      message.error(errorMessage)
    }
  }

  const filteredData = categories
    .filter(item => item.name.toLowerCase().includes(searchText.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "newest") return b.id - a.id;
      if (sortOrder === "name_asc") return a.name.localeCompare(b.name);
      if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

  const columns = [
    { title: "Số thứ tự", dataIndex: "id", key: "id", width: 100 },
    { title: "Tên Danh Mục", dataIndex: "name", key: "name" },
    { title: "Mô Tả", dataIndex: "description", key: "description" },
    // {
    //   title: "Thao Tác",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="small">
    //       <Tooltip title="Chỉnh sửa">
    //         <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
    //       </Tooltip>
    //       <Tooltip title="Xóa">
    //         <Button type="text" danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
  ]

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý danh mục</h1>
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Thêm danh mục
          </Button> */}
        </div>

        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Tìm kiếm theo tên danh mục..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </Col>
            <Col>
              <Select
                defaultValue="newest"
                style={{ width: 150 }}
                size="large"
                onChange={(value) => setSortOrder(value)}
                options={[
                  { value: "newest", label: "Mới nhất" },
                  { value: "name_asc", label: "Tên (A-Z)" },
                  { value: "name_desc", label: "Tên (Z-A)" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            size="middle"
          />
        </Card>
      </Content>

      <Modal
        title={editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Tên Danh Mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input placeholder="Nhập tên danh mục" size="large" />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea placeholder="Nhập mô tả danh mục" rows={4} />
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
        {deletingRecord && <p>Bạn có chắc chắn muốn xóa danh mục "{deletingRecord.name}" không?</p>}
      </Modal>
    </Layout>
  )
}
