import { useQuery } from '@tanstack/react-query'
import { Pagination, Typography } from 'antd'
import { useState } from 'react'
import { ApiRequestError } from '../../api/http'
import { getRequests } from '../../api/requests'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import HelperRequestTabs from '../../components/requests/HelperRequestTabs'
import RequestsTable from '../../components/requests/RequestsTable'
import { useAuth } from '../../context/AuthContext'

function ResolvedRequestsPage() {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const limit = 10

  const requestsQuery = useQuery({
    queryKey: ['requests', 'helper', 'resolved', { page, limit }],
    queryFn: () => getRequests(token!, { status: 'Resolved', onlyMy: true, page, limit }),
    enabled: Boolean(token),
  })

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
    <div className="page-view">
      <div className="page-view__header">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Выполненные
        </Typography.Title>
        <HelperRequestTabs />
      </div>

      {!items.length ? (
        <div className="page-view__body">
          <PageEmpty description="Выполненных заявок пока нет" />
        </div>
      ) : (
        <div className="page-view__body">
          <RequestsTable mode="resolved" requests={items} isLoading={requestsQuery.isFetching} />
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

export default ResolvedRequestsPage
