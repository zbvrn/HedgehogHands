import { useMemo } from 'react'
import { Modal, Select, Space, Table, Typography, message } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import { ApiRequestError } from '../../api/http'
import {
  getHelpers,
  updateUserRole,
  type UserResponse,
  type UserRole,
} from '../../api/users'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { useAuth } from '../../context/AuthContext'

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'parent', label: 'Родитель' },
  { value: 'helper', label: 'Помощник' },
  { value: 'admin', label: 'Администратор' },
]

function HelpersPage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  const helpersQuery = useQuery({
    queryKey: ['users', 'helpers'],
    queryFn: () => getHelpers(token!),
    enabled: Boolean(token),
  })

  const updateRoleMutation = useMutation({
    mutationFn: (params: { id: number; role: UserRole }) =>
      updateUserRole(token!, params.id, params.role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      message.success('Роль обновлена')
    },
  })

  const columns: ColumnsType<UserResponse> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: 'Имя', dataIndex: 'name', key: 'name' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      {
        title: 'Роль',
        dataIndex: 'role',
        key: 'role',
        width: 220,
        render: (value: UserRole, record) => (
          <Select
            value={value}
            options={roleOptions}
            style={{ width: '100%' }}
            disabled={updateRoleMutation.isPending}
            onChange={(nextRole) => {
              Modal.confirm({
                title: 'Подтвердите смену роли',
                content: `Пользователь #${record.id}: ${record.role} → ${nextRole}`,
                okText: 'Сменить',
                cancelText: 'Отмена',
                okButtonProps: { danger: true, loading: updateRoleMutation.isPending },
                onOk: async () => updateRoleMutation.mutate({ id: record.id, role: nextRole }),
              })
            }}
          />
        ),
      },
    ],
    [updateRoleMutation],
  )

  if (helpersQuery.isLoading) {
    return <PageLoading />
  }

  if (helpersQuery.error) {
    const err = helpersQuery.error
    const messageText =
      err instanceof ApiRequestError ? err.message : 'Ошибка загрузки помощников'
    return <PageError message={messageText} />
  }

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Помощники
        </Typography.Title>
      </Space>

      <div style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={helpersQuery.data ?? []}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  )
}

export default HelpersPage
