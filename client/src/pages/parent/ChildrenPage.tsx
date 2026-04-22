import { useMemo, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import { ApiRequestError } from '../../api/http'
import {
  createChild,
  deleteChild,
  getChildren,
  updateChild,
  type Child,
} from '../../api/children'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { useAuth } from '../../context/AuthContext'

type ChildFormValues = {
  name: string
  age: number
  features?: string
}

function ChildrenPage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const [form] = Form.useForm<ChildFormValues>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Child | null>(null)

  const childrenQuery = useQuery({
    queryKey: ['children'],
    queryFn: () => getChildren(token!),
    enabled: Boolean(token),
  })

  const createMutation = useMutation({
    mutationFn: (payload: ChildFormValues) => createChild(token!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['children'] })
      message.success('Карточка ребёнка создана')
      setIsModalOpen(false)
      setEditing(null)
      form.resetFields()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<ChildFormValues> }) =>
      updateChild(token!, payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['children'] })
      message.success('Данные ребёнка обновлены')
      setIsModalOpen(false)
      setEditing(null)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChild(token!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['children'] })
      message.success('Ребёнок удалён')
    },
  })

  const columns: ColumnsType<Child> = useMemo(
    () => [
      { title: 'Имя', dataIndex: 'name', key: 'name' },
      { title: 'Возраст', dataIndex: 'age', key: 'age', width: 110 },
      {
        title: 'Особенности',
        dataIndex: 'features',
        key: 'features',
        render: (value?: string | null) => value ?? '—',
      },
      {
        title: 'Действия',
        key: 'actions',
        width: 220,
        render: (_, record) => (
          <Space>
            <Button
              onClick={() => {
                setEditing(record)
                form.setFieldsValue({
                  name: record.name,
                  age: record.age,
                  features: record.features ?? undefined,
                })
                setIsModalOpen(true)
              }}
            >
              Редактировать
            </Button>
            <Button
              danger
              loading={deleteMutation.isPending}
              onClick={() => {
                Modal.confirm({
                  title: 'Удалить ребёнка?',
                  content: 'Это действие нельзя отменить.',
                  okText: 'Удалить',
                  cancelText: 'Отмена',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    deleteMutation.mutate(record.id)
                  },
                })
              }}
            >
              Удалить
            </Button>
          </Space>
        ),
      },
    ],
    [deleteMutation, form],
  )

  if (childrenQuery.isLoading) return <PageLoading />

  if (childrenQuery.error) {
    const err = childrenQuery.error
    const messageText =
      err instanceof ApiRequestError ? err.message : 'Ошибка загрузки детей'
    return <PageError message={messageText} />
  }

  const data = childrenQuery.data ?? []

  return (
    <div className="page-view">
      <div className="page-view__header">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Дети
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Добавить
        </Button>
      </div>

      <div className="page-view__body">
        {data.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
          />
        ) : (
          <PageEmpty description="Пока нет детей. Добавьте первую карточку." />
        )}
      </div>

      <Modal
        open={isModalOpen}
        title={editing ? 'Редактирование ребёнка' : 'Новый ребёнок'}
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
          const payload: ChildFormValues = {
            name: values.name.trim(),
            age: values.age,
            features: values.features?.trim() || undefined,
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
            label="Имя"
            name="name"
            rules={[
              { required: true, message: 'Введите имя' },
              { max: 100, message: 'Максимум 100 символов' },
            ]}
          >
            <Input placeholder="Например: Маша" />
          </Form.Item>
          <Form.Item
            label="Возраст"
            name="age"
            rules={[{ required: true, message: 'Укажите возраст' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Особенности" name="features" rules={[{ max: 500 }]}>
            <Input.TextArea rows={3} placeholder="Аллергии, характер, особенности развития..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ChildrenPage
