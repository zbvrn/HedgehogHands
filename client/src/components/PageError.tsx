import { Alert } from 'antd'

type PageErrorProps = {
  message?: string
  description?: string
}

function PageError({ message, description }: PageErrorProps) {
  return (
    <div style={{ padding: 24 }}>
      <Alert
        type="error"
        showIcon
        message={message ?? 'Something went wrong'}
        description={description}
      />
    </div>
  )
}

export default PageError
