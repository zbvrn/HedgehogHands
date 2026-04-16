import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiRequestError } from '../../api/http'
import { getCategories } from '../../api/categories'
import { getAnnouncements, type Announcement } from '../../api/announcements'
import { createRequest } from '../../api/requests'
import { getChildren, type Child } from '../../api/children'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { useAuth } from '../../context/AuthContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

type RequestFormValues = {
  childId: number
  message?: string
}

function SearchPage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const limit = 10
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [form] = Form.useForm<RequestFormValues>()

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => getCategories(token!, false),
    enabled: Boolean(token),
  })

  const childrenQuery = useQuery({
    queryKey: ['children'],
    queryFn: () => getChildren(token!),
    enabled: Boolean(token),
  })

  const announcementsQuery = useQuery({
    queryKey: ['announcements', { categoryId, search: debouncedSearch, page, limit }],
    queryFn: () =>
      getAnnouncements(token!, { categoryId, search: debouncedSearch, page, limit }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData,
  })

  const createRequestMutation = useMutation({
    mutationFn: (payload: { announcementId: number; childId: number; message?: string }) =>
      createRequest(token!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests'] })
      message.success('Отклик отправлен')
      setIsModalOpen(false)
      setSelectedAnnouncement(null)
      form.resetFields()
    },
  })

  const categoryOptions = useMemo(() => {
    const items: Array<{ value: number; label: string }> = []
    for (const cat of categoriesQuery.data ?? []) {
      items.push({ value: cat.id, label: cat.name })
    }
    return items
  }, [categoriesQuery.data])

  const isInitialLoading = categoriesQuery.isLoading || announcementsQuery.isLoading
  if (isInitialLoading && !announcementsQuery.data) return <PageLoading />

  const error = categoriesQuery.error ?? announcementsQuery.error
  if (error) {
    const messageText =
      error instanceof ApiRequestError ? error.message : 'Ошибка загрузки данных'
    return <PageError message={messageText} />
  }

  const data = announcementsQuery.data
  if (!data || !data.items.length) {
    return (
      <div style={{ padding: 24, textAlign: 'left' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Поиск помощника
        </Typography.Title>
        <div style={{ marginTop: 16 }}>
          <Space wrap>
            <Select
              allowClear
              placeholder="Категория"
              options={categoryOptions}
              style={{ width: 280 }}
              value={categoryId}
              onChange={(value) => {
                setPage(1)
                setCategoryId(value)
              }}
            />
            <Input.Search
              placeholder="Поиск по названию или описанию"
              style={{ width: 360 }}
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              allowClear
            />
          </Space>
        </div>
        <PageEmpty description="Объявлений не найдено" />
      </div>
    )
  }

  const childOptions = (childrenQuery.data ?? []).map((child: Child) => ({
    value: child.id,
    label: `${child.name}, ${child.age} лет`,
  }))

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Поиск помощника
      </Typography.Title>

      <div style={{ marginTop: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Категория"
            options={categoryOptions}
            style={{ width: 280 }}
            value={categoryId}
            onChange={(value) => {
              setPage(1)
              setCategoryId(value)
            }}
          />
          <Input.Search
            placeholder="Поиск по названию или описанию"
            style={{ width: 360 }}
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            allowClear
          />
        </Space>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {data.items.map((item) => (
          <Card
            key={item.id}
            title={
              <Space wrap>
                <Typography.Text strong>{item.title}</Typography.Text>
                <Tag>{item.category.name}</Tag>
                {!item.isActive && <Tag color="default">Неактивно</Tag>}
              </Space>
            }
            extra={<Typography.Text type="secondary">{item.helper.name}</Typography.Text>}
          >
            <Typography.Paragraph style={{ marginTop: 0, marginBottom: 12 }}>
              {item.description}
            </Typography.Paragraph>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Typography.Text>
                {item.price ? `Цена: ${item.price} ₽` : 'Цена: по договоренности'}
              </Typography.Text>
              <Button
                type="primary"
                onClick={() => {
                  if (!childOptions.length) {
                    message.warning('Сначала добавьте ребёнка в разделе «Дети»')
                    return
                  }
                  setSelectedAnnouncement(item)
                  form.resetFields()
                  setIsModalOpen(true)
                }}
              >
                Откликнуться
              </Button>
            </Space>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page}
          total={data.total}
          pageSize={limit}
          onChange={(nextPage) => setPage(nextPage)}
          showSizeChanger={false}
        />
      </div>

      <Modal
        open={isModalOpen}
        title="Отклик на объявление"
        okText="Отправить"
        cancelText="Отмена"
        confirmLoading={createRequestMutation.isPending}
        onCancel={() => {
          setIsModalOpen(false)
          setSelectedAnnouncement(null)
          form.resetFields()
        }}
        onOk={async () => {
          const values = await form.validateFields()
          const announcementId = selectedAnnouncement?.id
          if (!announcementId) return
          createRequestMutation.mutate({
            announcementId,
            childId: values.childId,
            message: values.message?.trim() || undefined,
          })
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Ребёнок"
            name="childId"
            rules={[{ required: true, message: 'Выберите ребёнка' }]}
          >
            <Select options={childOptions} placeholder="Выберите ребёнка" />
          </Form.Item>
          <Form.Item label="Сообщение" name="message">
            <Input.TextArea rows={4} placeholder="Коротко опишите запрос..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SearchPage
