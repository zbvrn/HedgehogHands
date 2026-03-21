import { Result } from 'antd'

function PageNotFound() {
  return (
    <div style={{ padding: 24 }}>
      <Result status="404" title="404" subTitle="Page not found" />
    </div>
  )
}

export default PageNotFound
