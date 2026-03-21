import { Result } from 'antd'

function ForbiddenPage() {
  return (
    <div style={{ padding: 24 }}>
      <Result status="403" title="403" subTitle="Access denied" />
    </div>
  )
}

export default ForbiddenPage
