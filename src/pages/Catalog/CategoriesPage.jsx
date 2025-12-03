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
} from "antd"
import { toast } from "react-hot-toast";
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
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [deletingRecord, setDeletingRecord] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Lấy danh sách category từ backend và loại bỏ soft-deleted
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryApi.getPublicCategories()
      let categoriesData = []

      if (Array.isArray(data)) {
        categoriesData = data
      } else if (data?.data && Array.isArray(data.data)) {
        categoriesData = data.data
      }

      // Chỉ giữ các category chưa bị xóa
      const activeCategories = categoriesData.filter(
        (cat) => !cat.deletedAt && !cat.deleted
      )

      setCategories(activeCategories.reverse())
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Không thể tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

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
      // Xóa ngay category khỏi state
      setCategories((prev) =>
        prev.filter((item) => item.id !== deletingRecord.id)
      )
      toast.success("Đã xóa danh mục thành công!")
    } catch (error) {
      console.error("Error deleting category:", error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa danh mục. Có thể danh mục này đang được sử dụng."
      toast.error(errorMessage)
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
        // Cập nhật category
        const updatedCategory = await categoryApi.updateCategory(editingId, values)
        // Cập nhật state chỉ nếu category chưa bị soft-delete
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId ? { ...cat, ...updatedCategory } : cat
          ).filter(cat => !cat.deletedAt && !cat.deleted)
        )
        toast.success("Cập nhật danh mục thành công")
      } else {
        // Thêm category mới
        const newCategory = await categoryApi.createCategory(values)
        if (!newCategory.deletedAt && !newCategory.deleted) {
          setCategories((prev) => [newCategory, ...prev.filter(cat => !cat.deletedAt && !cat.deleted)])
        }
        toast.success("Thêm danh mục thành công")
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingId(null)
    } catch (error) {
      console.error("Error saving category:", error)
      const errorMessage =
        error.response?.data?.message || error.message || "Không thể lưu danh mục"
      toast.error(errorMessage)
    }
  }

  const filteredData = categories
    .filter((item) => !item.deletedAt && !item.deleted)
    .filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    )

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Tên Danh Mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thao Tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
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
  ]

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý danh mục</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Thêm danh mục
          </Button>
        </div>

        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Tìm kiếm theo tên hoặc nội dung..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </Col>
            <Col>
              <Button icon={<FilterOutlined />} size="large" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Tất cả
              </Button>
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
        width={600}
        okText="Lưu"
        cancelText="Hủy"
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
        {deletingRecord && (
          <p>
            Bạn có chắc chắn muốn xóa danh mục "{deletingRecord.name}" không?
          </p>
        )}
      </Modal>
    </Layout>
  )
}
