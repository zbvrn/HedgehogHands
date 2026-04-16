import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal, Pagination, Space, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { ApiRequestError } from '../../api/http'
import {
  changeRequestStatus,
  getRequests,
  rejectRequest,
  type RequestItem,
} from '../../api/requests'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import RequestsTable from '../../components/requests/RequestsTable'
import RejectRequestModal from '../../components/requests/RejectRequestModal'
import { useAuth } from '../../context/AuthContext'

function NewRequestsPage() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 10

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState<number | null>(null)

  const requestsQuery = useQuery({
    queryKey: ['requests', 'helper', 'new', { page, limit }],
    queryFn: () => getRequests(token!, { status: 'New', onlyMy: true, page, limit }),
    enabled: Boolean(token),
  })

  const statusMutation = useMutation({
    mutationFn: (args: { id: number; status: 'InProgress' }) =>
      changeRequestStatus(token!, args.id, args.status),
    onSuccess: async (updated: RequestItem) => {
      message.success(`Заявка #${updated.id} взята в работу`)
      await queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось изменить статус'
      message.error(msg)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (args: { id: number; reason: string }) => rejectRequest(token!, args.id, args.reason),
    onSuccess: async (updated: RequestItem) => {
      message.success(`Заявка #${updated.id} отклонена`)
      setRejectOpen(false)
      setRejectId(null)
      await queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось отклонить заявку'
      message.error(msg)
    },
  })

  const isBusy = statusMutation.isPending || rejectMutation.isPending

  const pageTitle = useMemo(
    () => (
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Новые отклики
        </Typography.Title>
      </Space>
    ),
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
  const items = data?.items ?? []

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      {pageTitle}

      {!items.length ? (
        <div style={{ marginTop: 16 }}>
          <PageEmpty description="Новых откликов пока нет" />
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <RequestsTable
            mode="new"
            requests={items}
            isLoading={requestsQuery.isFetching}
            onStatusChange={(id, newStatus) => {
              if (newStatus !== 'InProgress') return
              Modal.confirm({
                title: 'Взять заявку в работу?',
                okText: 'Взять',
                cancelText: 'Отмена',
                okButtonProps: { loading: statusMutation.isPending },
                cancelButtonProps: { disabled: isBusy },
                onOk: async () => {
                  await statusMutation.mutateAsync({ id, status: 'InProgress' })
                },
              })
            }}
            onReject={(id) => {
              setRejectId(id)
              setRejectOpen(true)
            }}
          />

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={page}
              total={data?.total ?? 0}
              pageSize={limit}
              onChange={(nextPage) => setPage(nextPage)}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}

      <RejectRequestModal
        open={rejectOpen}
        isLoading={rejectMutation.isPending}
        onCancel={() => {
          if (isBusy) return
          setRejectOpen(false)
          setRejectId(null)
        }}
        onSubmit={(reason) => {
          if (!rejectId) return
          rejectMutation.mutate({ id: rejectId, reason })
        }}
      />
    </div>
  )
}

export default NewRequestsPage

