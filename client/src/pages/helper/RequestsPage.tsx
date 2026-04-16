import { useMemo, useState } from 'react'
import { Pagination, Select, Space, Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { ApiRequestError } from '../../api/http'
import { getRequests, type RequestItem, type RequestStatus } from '../../api/requests'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { useAuth } from '../../context/AuthContext'

const statusOptions: Array<{ value: RequestStatus; label: string }> = [
  { value: 'New', label: 'Новые' },
  { value: 'InProgress', label: 'В работе' },
  { value: 'Resolved', label: 'Выполненные' },
  { value: 'Rejected', label: 'Отклонённые' },
]

const statusTag = (status: RequestStatus) => {
  if (status === 'New') return <Tag color="blue">New</Tag>
  if (status === 'InProgress') return <Tag color="gold">InProgress</Tag>
  if (status === 'Resolved') return <Tag color="green">Resolved</Tag>
  return <Tag color="red">Rejected</Tag>
}

function RequestsPage() {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const limit = 10
  const [status, setStatus] = useState<RequestStatus | undefined>(undefined)

  const requestsQuery = useQuery({
    queryKey: ['requests', 'helper', { page, limit, status }],
    queryFn: () => getRequests(token!, { page, limit, status }),
    enabled: Boolean(token),
  })

  const columns: ColumnsType<RequestItem> = useMemo(
    () => [
      {
        title: 'Дата',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 200,
        render: (value: string) => new Date(value).toLocaleString(),
      },
      {
        title: 'Объявление',
        dataIndex: ['announcement', 'title'],
        key: 'announcement',
        render: (_, record) => (
          <Link to={`/requests/${record.id}`}>{record.announcement.title}</Link>
        ),
      },
      {
        title: 'Родитель',
        dataIndex: ['parent', 'name'],
        key: 'parent',
        width: 220,
        render: (_, record) => `${record.parent.name} (${record.parent.email})`,
      },
      {
        title: 'Ребёнок',
        dataIndex: ['child', 'name'],
        key: 'child',
        width: 200,
        render: (_, record) => `${record.child.name} (${record.child.age})`,
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        width: 160,
        render: (value: RequestStatus) => statusTag(value),
      },
    ],
    [],
  )

  if (requestsQuery.isLoading) return <PageLoading />
  if (requestsQuery.error) {
    const err = requestsQuery.error
    const messageText =
      err instanceof ApiRequestError ? err.message : 'Ошибка загрузки заявок'
    return <PageError message={messageText} />
  }

  const data = requestsQuery.data
  if (!data || !data.items.length) {
    return (
      <div style={{ padding: 24, textAlign: 'left' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Заявки
          </Typography.Title>
          <Select
            allowClear
            placeholder="Статус"
            options={statusOptions}
            style={{ width: 240 }}
            value={status}
            onChange={(value) => {
              setPage(1)
              setStatus(value)
            }}
          />
        </Space>
        <PageEmpty description="Откликов пока нет" />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Заявки
        </Typography.Title>
        <Select
          allowClear
          placeholder="Статус"
          options={statusOptions}
          style={{ width: 240 }}
          value={status}
          onChange={(value) => {
            setPage(1)
            setStatus(value)
          }}
        />
      </Space>

      <div style={{ marginTop: 16 }}>
        <Table rowKey="id" columns={columns} dataSource={data.items} pagination={false} />
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
    </div>
  )
}

export default RequestsPage

