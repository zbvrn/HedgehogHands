import { Spin } from 'antd'

function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Spin size="large" />
    </div>
  )
}

export default PageLoading
