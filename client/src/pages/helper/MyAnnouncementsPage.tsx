import { useMemo, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
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
import { getCategories } from '../../api/categories'
import {
  createAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
  updateAnnouncement,
  type Announcement,
} from '../../api/announcements'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { useAuth } from '../../context/AuthContext'

type AnnouncementFormValues = {
  title: string
  description: string
  price?: number
  categoryId: number
  isActive?: boolean
}

function MyAnnouncementsPage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const limit = 10
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form] = Form.useForm<AnnouncementFormValues>()

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => getCategories(token!, false),
    enabled: Boolean(token),
  })

  const myQuery = useQuery({
    queryKey: ['announcements', 'my', { page, limit }],
    queryFn: () => getMyAnnouncements(token!, { page, limit }),
    enabled: Boolean(token),
  })

  const createMutation = useMutation({
    mutationFn: (payload: AnnouncementFormValues) =>
      createAnnouncement(token!, {
        title: payload.title,
        description: payload.description,
        price: payload.price,
        categoryId: payload.categoryId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements', 'my'] })
      message.success('Объявление создано')
      setIsModalOpen(false)
      setEditing(null)
      form.resetFields()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<AnnouncementFormValues> }) =>
      updateAnnouncement(token!, payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements', 'my'] })
      message.success('Объявление обновлено')
      setIsModalOpen(false)
      setEditing(null)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAnnouncement(token!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements', 'my'] })
      message.success('Объявление удалено')
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось удалить объявление'
      message.error(msg)
    },
  })

  const categoryOptions = (categoriesQuery.data ?? []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  const columns: ColumnsType<Announcement> = useMemo(
    () => [
      { title: 'Название', dataIndex: 'title', key: 'title' },
      {
        title: 'Категория',
        dataIndex: ['category', 'name'],
        key: 'category',
        width: 200,
        render: (_, record) => <Tag>{record.category.name}</Tag>,
      },
      {
        title: 'Цена',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        render: (value?: number | null) => (value ? `${value} ₽` : '—'),
      },
      {
        title: 'Активно',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 110,
        render: (value: boolean) => (value ? <Tag color="green">Да</Tag> : <Tag>Нет</Tag>),
      },
      {
        title: 'Действия',
        key: 'actions',
        width: 280,
        render: (_, record) => (
          <Space>
            <Button
              onClick={() => {
                setEditing(record)
                form.setFieldsValue({
                  title: record.title,
                  description: record.description,
                  price: record.price ?? undefined,
                  categoryId: record.category.id,
                  isActive: record.isActive,
                })
                setIsModalOpen(true)
              }}
            >
              Редактировать
            </Button>
            <Switch
              checked={record.isActive}
              onChange={(checked) =>
                updateMutation.mutate({ id: record.id, data: { isActive: checked } })
              }
              disabled={updateMutation.isPending}
            />
            <Button
              danger
              loading={deleteMutation.isPending}
              onClick={() => {
                Modal.confirm({
                  title: 'Удалить объявление?',
                  content: 'Удаление удалит объявление и связанные с ним заявки.',
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
    [deleteMutation, form, updateMutation],
  )

  if (categoriesQuery.isLoading || myQuery.isLoading) return <PageLoading />
  const error = categoriesQuery.error ?? myQuery.error
  if (error) {
    const messageText =
      error instanceof ApiRequestError ? error.message : 'Ошибка загрузки данных'
    return <PageError message={messageText} />
  }

  const data = myQuery.data

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Мои объявления
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
      </Space>

      {data?.items?.length ? (
        <div style={{ marginTop: 16 }}>
          <Table rowKey="id" columns={columns} dataSource={data.items} pagination={false} />
        </div>
      ) : (
        <PageEmpty description="У вас пока нет объявлений" />
      )}

      {data?.total ? (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={page}
            total={data.total}
            pageSize={limit}
            onChange={(nextPage) => setPage(nextPage)}
            showSizeChanger={false}
          />
        </div>
      ) : null}

      <Modal
        open={isModalOpen}
        title={editing ? 'Редактирование объявления' : 'Новое объявление'}
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
          const payload = {
            title: values.title.trim(),
            description: values.description.trim(),
            price: values.price,
            categoryId: values.categoryId,
          }
          if (editing) {
            updateMutation.mutate({ id: editing.id, data: payload })
          } else {
            createMutation.mutate(payload)
          }
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Заголовок"
            name="title"
            rules={[
              { required: true, message: 'Введите заголовок' },
              { max: 120, message: 'Максимум 120 символов' },
            ]}
          >
            <Input placeholder="Например: Репетитор английского онлайн" />
          </Form.Item>
          <Form.Item
            label="Описание"
            name="description"
            rules={[{ required: true, message: 'Введите описание' }, { max: 2000 }]}
          >
            <Input.TextArea rows={5} placeholder="Опыт, формат, условия..." />
          </Form.Item>
          <Form.Item label="Категория" name="categoryId" rules={[{ required: true }]}>
            <Select options={categoryOptions} placeholder="Выберите категорию" />
          </Form.Item>
          <Form.Item label="Цена (опционально)" name="price">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyAnnouncementsPage
