import { useMemo, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import { ApiRequestError } from '../../api/http'
import {
  createCategory,
  deleteCategory,
  getCategories,
  setCategoryActive,
  updateCategory,
  type Category,
} from '../../api/categories'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { useAuth } from '../../context/AuthContext'

type CategoryFormValues = {
  name: string
}

function CategoriesPage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const [form] = Form.useForm<CategoryFormValues>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['categories', { includeInactive: true }],
    queryFn: () => getCategories(token!, true),
    enabled: Boolean(token),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(token!, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('Категория создана')
      setIsModalOpen(false)
      setEditing(null)
      form.resetFields()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (params: { id: number; name: string }) =>
      updateCategory(token!, params.id, params.name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('Категория обновлена')
      setIsModalOpen(false)
      setEditing(null)
      form.resetFields()
    },
  })

  const activeMutation = useMutation({
    mutationFn: (params: { id: number; isActive: boolean }) =>
      setCategoryActive(token!, params.id, params.isActive),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('Статус обновлён')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(token!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('Категория удалена')
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось удалить категорию'
      message.error(msg)
    },
  })

  const columns: ColumnsType<Category> = useMemo(
    () => [
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
        render: (value: string) => <Typography.Text>{value}</Typography.Text>,
      },
      {
        title: 'Статус',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 140,
        render: (value: boolean) =>
          value ? <Tag color="green">Активна</Tag> : <Tag>Неактивна</Tag>,
      },
      {
        title: 'Действия',
        key: 'actions',
        width: 320,
        render: (_, record) => (
          <Space>
            <Button
              onClick={() => {
                setEditing(record)
                form.setFieldsValue({ name: record.name })
                setIsModalOpen(true)
              }}
            >
              Редактировать
            </Button>
            <Switch
              checked={record.isActive}
              loading={activeMutation.isPending}
              onChange={(checked) =>
                activeMutation.mutate({ id: record.id, isActive: checked })
              }
            />
            <Button
              danger
              loading={deleteMutation.isPending}
              onClick={() => {
                Modal.confirm({
                  title: 'Удалить категорию?',
                  content: 'Удаление возможно только если нет объявлений в этой категории.',
                  okText: 'Удалить',
                  cancelText: 'Отмена',
                  okButtonProps: { danger: true, loading: deleteMutation.isPending },
                  onOk: async () => deleteMutation.mutate(record.id),
                })
              }}
            >
              Удалить
            </Button>
          </Space>
        ),
      },
    ],
    [activeMutation, deleteMutation, form],
  )

  if (categoriesQuery.isLoading) {
    return <PageLoading />
  }

  if (categoriesQuery.error) {
    const err = categoriesQuery.error
    const messageText =
      err instanceof ApiRequestError ? err.message : 'Ошибка загрузки категорий'
    return <PageError message={messageText} />
  }

  const data = categoriesQuery.data ?? []

  return (
    <div className="page-view">
      <div className="page-view__header">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Категории
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Создать
        </Button>
      </div>

      <div className="page-view__body">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: false, position: ['bottomRight'] }}
          size="small"
        />
      </div>

      <Modal
        open={isModalOpen}
        title={editing ? 'Редактирование категории' : 'Новая категория'}
        okText={editing ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setIsModalOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        onOk={async () => {
          const values = await form.validateFields()
          const name = values.name.trim()
          if (!name) {
            return
          }
          if (editing) {
            updateMutation.mutate({ id: editing.id, name })
          } else {
            createMutation.mutate(name)
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Название"
            name="name"
            rules={[
              { required: true, message: 'Введите название' },
              { max: 100, message: 'Максимум 100 символов' },
            ]}
          >
            <Input placeholder="Например: Няня" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoriesPage
