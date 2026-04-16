import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Descriptions, Modal, Space, Tag, Typography, message } from 'antd'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApiRequestError } from '../api/http'
import { changeRequestStatus, getRequestById, rejectRequest } from '../api/requests'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import RejectRequestModal from '../components/requests/RejectRequestModal'
import { useAuth } from '../context/AuthContext'

function RequestDetailPage() {
  const { id } = useParams()
  const requestId = Number(id)
  const { token, role, user } = useAuth()
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)

  const requestQuery = useQuery({
    queryKey: ['requests', 'detail', requestId],
    queryFn: () => getRequestById(token!, requestId),
    enabled: Boolean(token) && Number.isFinite(requestId),
  })

  const statusMutation = useMutation({
    mutationFn: (args: { status: 'InProgress' | 'Resolved' }) =>
      changeRequestStatus(token!, requestId, args.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось изменить статус'
      message.error(msg)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (args: { reason: string }) => rejectRequest(token!, requestId, args.reason),
    onSuccess: async () => {
      message.success('Заявка отклонена')
      setRejectOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось отклонить заявку'
      message.error(msg)
    },
  })

  if (requestQuery.isLoading) return <PageLoading />
  if (requestQuery.error) {
    const err = requestQuery.error
    const messageText =
      err instanceof ApiRequestError ? err.message : 'Ошибка загрузки заявки'
    return <PageError message={messageText} />
  }

  const data = requestQuery.data
  if (!data) return <PageError message="Заявка не найдена" />

  const isHelperOwner =
    role === 'helper' && Boolean(user) && user!.id === data.announcement.helper.id

  const statusTag = (() => {
    if (data.status === 'New') return <Tag color="blue">New</Tag>
    if (data.status === 'InProgress') return <Tag color="gold">InProgress</Tag>
    if (data.status === 'Resolved') return <Tag color="green">Resolved</Tag>
    return <Tag color="red">Rejected</Tag>
  })()

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        {role === 'parent' ? `Заявка #${data.number}` : `Заявка #${data.id}`}
      </Typography.Title>

      {isHelperOwner && (data.status === 'New' || data.status === 'InProgress') ? (
        <div style={{ marginBottom: 12 }}>
          <Space>
            {data.status === 'New' ? (
              <Button
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    title: 'Взять заявку в работу?',
                    okText: 'Взять',
                    cancelText: 'Отмена',
                    okButtonProps: { loading: statusMutation.isPending },
                    onOk: async () => {
                      await statusMutation.mutateAsync({ status: 'InProgress' })
                      message.success('Заявка взята в работу')
                    },
                  })
                }}
              >
                Взять в работу
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    title: 'Завершить заявку?',
                    okText: 'Завершить',
                    cancelText: 'Отмена',
                    okButtonProps: { loading: statusMutation.isPending },
                    onOk: async () => {
                      await statusMutation.mutateAsync({ status: 'Resolved' })
                      message.success('Заявка завершена')
                    },
                  })
                }}
              >
                Завершить
              </Button>
            )}

            {data.status === 'New' ? (
              <Button
                danger
                onClick={() => setRejectOpen(true)}
                loading={rejectMutation.isPending}
              >
                Отклонить
              </Button>
            ) : null}
          </Space>
        </div>
      ) : null}

      <Card>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Статус">{statusTag}</Descriptions.Item>
          <Descriptions.Item label="Дата">
            {new Date(data.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Объявление">{data.announcement.title}</Descriptions.Item>
          <Descriptions.Item label="Категория">{data.announcement.category.name}</Descriptions.Item>
          <Descriptions.Item label="Помощник">{data.announcement.helper.name}</Descriptions.Item>
          <Descriptions.Item label="Родитель">
            {data.parent.name} ({data.parent.email})
          </Descriptions.Item>
          <Descriptions.Item label="Ребёнок">
            {data.child.name}, {data.child.age} лет
          </Descriptions.Item>
          <Descriptions.Item label="Сообщение">{data.message ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Причина отклонения">
            {data.rejectionReason ?? '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <RejectRequestModal
        open={rejectOpen}
        isLoading={rejectMutation.isPending}
        onCancel={() => setRejectOpen(false)}
        onSubmit={(reason) => rejectMutation.mutate({ reason })}
      />
    </div>
  )
}

export default RequestDetailPage
