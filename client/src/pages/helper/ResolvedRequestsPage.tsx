import { useQuery } from '@tanstack/react-query'
import { Pagination, Space, Typography } from 'antd'
import { useState } from 'react'
import { ApiRequestError } from '../../api/http'
import { getRequests } from '../../api/requests'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
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
    <div style={{ padding: 24, textAlign: 'left' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Выполненные
        </Typography.Title>
      </Space>

      {!items.length ? (
        <div style={{ marginTop: 16 }}>
          <PageEmpty description="Выполненных заявок пока нет" />
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <RequestsTable mode="resolved" requests={items} isLoading={requestsQuery.isFetching} />

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
    </div>
  )
}

export default ResolvedRequestsPage

