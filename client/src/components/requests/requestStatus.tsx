import { Tag } from 'antd'
import type { RequestStatus } from '../../api/requests'

export const requestStatusLabels: Record<RequestStatus, string> = {
  New: 'Новая',
  InProgress: 'В работе',
  Resolved: 'Выполнена',
  Rejected: 'Отклонена',
}

const requestStatusColors: Record<RequestStatus, string> = {
  New: 'blue',
  InProgress: 'gold',
  Resolved: 'green',
  Rejected: 'red',
}

export const requestStatusOptions: Array<{ value: RequestStatus; label: string }> = [
  { value: 'New', label: 'Новые' },
  { value: 'InProgress', label: 'В работе' },
  { value: 'Resolved', label: 'Выполненные' },
  { value: 'Rejected', label: 'Отклонённые' },
]

export function renderRequestStatusTag(status: RequestStatus) {
  return <Tag color={requestStatusColors[status]}>{requestStatusLabels[status]}</Tag>
}
