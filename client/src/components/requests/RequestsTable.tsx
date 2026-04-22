import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { RequestItem, RequestStatus } from '../../api/requests'
import { renderRequestStatusTag } from './requestStatus'

type Mode = 'new' | 'inProgress' | 'resolved'

type Props = {
  requests: RequestItem[]
  mode: Mode
  isLoading?: boolean
  onStatusChange?: (id: number, newStatus: RequestStatus) => void
  onReject?: (id: number) => void
}

function RequestsTable({ requests, mode, isLoading, onStatusChange, onReject }: Props) {
  const columns: ColumnsType<RequestItem> = useMemo(() => {
    const base: ColumnsType<RequestItem> = [
      {
        title: 'Дата',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 170,
        render: (value: string) =>
          new Date(value).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
      {
        title: 'Объявление',
        dataIndex: ['announcement', 'title'],
        key: 'announcement',
        render: (_, record) => <Link to={`/requests/${record.id}`}>{record.announcement.title}</Link>,
      },
      {
        title: 'Родитель',
        dataIndex: ['parent', 'name'],
        key: 'parent',
        width: 210,
        render: (_, record) => `${record.parent.name} (${record.parent.email})`,
      },
      {
        title: 'Ребёнок',
        dataIndex: ['child', 'name'],
        key: 'child',
        width: 150,
        render: (_, record) => `${record.child.name} (${record.child.age})`,
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (value: RequestStatus) => renderRequestStatusTag(value),
      },
    ]

    if (mode === 'resolved') return base

    base.push({
      title: 'Действия',
      key: 'actions',
      width: 210,
      render: (_, record) => {
        if (mode === 'new') {
          return (
            <Space>
              <Button type="primary" onClick={() => onStatusChange?.(record.id, 'InProgress')}>
                Взять в работу
              </Button>
              <Button danger onClick={() => onReject?.(record.id)}>
                Отклонить
              </Button>
            </Space>
          )
        }

        return (
          <Space>
            <Button type="primary" onClick={() => onStatusChange?.(record.id, 'Resolved')}>
              Завершить
            </Button>
          </Space>
        )
      },
    })

    return base
  }, [mode, onReject, onStatusChange])

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={requests}
      loading={isLoading}
      pagination={false}
      size="small"
    />
  )
}

export default RequestsTable
