import { Empty } from 'antd'

type PageEmptyProps = {
  description?: string
}

function PageEmpty({ description }: PageEmptyProps) {
  return (
    <div style={{ padding: 32 }}>
      <Empty description={description ?? 'No data'} />
    </div>
  )
}

export default PageEmpty
