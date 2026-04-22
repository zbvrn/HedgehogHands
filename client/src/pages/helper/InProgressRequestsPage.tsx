import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal, Pagination, Typography, message } from 'antd'
import { useState } from 'react'
import { ApiRequestError } from '../../api/http'
import { changeRequestStatus, getRequests } from '../../api/requests'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import HelperRequestTabs from '../../components/requests/HelperRequestTabs'
import RequestsTable from '../../components/requests/RequestsTable'
import { useAuth } from '../../context/AuthContext'

function InProgressRequestsPage() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 10

  const requestsQuery = useQuery({
    queryKey: ['requests', 'helper', 'inProgress', { page, limit }],
    queryFn: () => getRequests(token!, { status: 'InProgress', onlyMy: true, page, limit }),
    enabled: Boolean(token),
  })

  const statusMutation = useMutation({
    mutationFn: (args: { id: number; status: 'Resolved' }) =>
      changeRequestStatus(token!, args.id, args.status),
    onSuccess: async () => {
      message.success('Заявка завершена')
      await queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Не удалось изменить статус'
      message.error(msg)
    },
  })

  if (requestsQuery.isLoading) return <PageLoading />
  if (requestsQuery.error) {
    const err = requestsQuery.error
    const messageText = err instanceof ApiRequestError ? err.message : 'Ошибка загрузки заявок'
    return <PageError message={messageText} />
  }

  const data = requestsQuery.data
  const items = data?.items ?? []

  return (
    <div className="page-view">
      <div className="page-view__header">
        <Typography.Title level={2} style={{ margin: 0 }}>
          В работе
        </Typography.Title>
        <HelperRequestTabs />
      </div>

      {!items.length ? (
        <div className="page-view__body">
          <PageEmpty description="Заявок в работе пока нет" />
        </div>
      ) : (
        <div className="page-view__body">
          <RequestsTable
            mode="inProgress"
            requests={items}
            isLoading={requestsQuery.isFetching}
            onStatusChange={(id, newStatus) => {
              if (newStatus !== 'Resolved') return
              Modal.confirm({
                title: 'Завершить заявку?',
                okText: 'Завершить',
                cancelText: 'Отмена',
                okButtonProps: { loading: statusMutation.isPending },
                onOk: async () => {
                  await statusMutation.mutateAsync({ id, status: 'Resolved' })
                },
              })
            }}
          />
        </div>
      )}

      {data?.total ? (
        <div className="page-view__footer">
          <Pagination
            current={page}
            total={data.total}
            pageSize={limit}
            onChange={(nextPage) => setPage(nextPage)}
            showSizeChanger={false}
          />
        </div>
      ) : null}
    </div>
  )
}

export default InProgressRequestsPage
