import { Card, Descriptions, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ApiRequestError } from '../api/http'
import { getRequestById } from '../api/requests'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import { useAuth } from '../context/AuthContext'

function RequestDetailPage() {
  const { id } = useParams()
  const requestId = Number(id)
  const { token } = useAuth()

  const requestQuery = useQuery({
    queryKey: ['requests', 'detail', requestId],
    queryFn: () => getRequestById(token!, requestId),
    enabled: Boolean(token) && Number.isFinite(requestId),
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

  const statusTag = (() => {
    if (data.status === 'New') return <Tag color="blue">New</Tag>
    if (data.status === 'InProgress') return <Tag color="gold">InProgress</Tag>
    if (data.status === 'Resolved') return <Tag color="green">Resolved</Tag>
    return <Tag color="red">Rejected</Tag>
  })()

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        Заявка #{data.id}
      </Typography.Title>

      <Card>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Статус">{statusTag}</Descriptions.Item>
          <Descriptions.Item label="Дата">
            {new Date(data.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Объявление">
            {data.announcement.title}
          </Descriptions.Item>
          <Descriptions.Item label="Категория">
            {data.announcement.category.name}
          </Descriptions.Item>
          <Descriptions.Item label="Помощник">
            {data.announcement.helper.name}
          </Descriptions.Item>
          <Descriptions.Item label="Родитель">
            {data.parent.name} ({data.parent.email})
          </Descriptions.Item>
          <Descriptions.Item label="Ребёнок">
            {data.child.name}, {data.child.age} лет
          </Descriptions.Item>
          <Descriptions.Item label="Сообщение">
            {data.message ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Причина отклонения">
            {data.rejectionReason ?? '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default RequestDetailPage

