import React from 'react'
import { Button, Result } from 'antd'

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // eslint-disable-next-line no-console
    console.error('Ошибка рендеринга:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <Result
            status="500"
            title="Что-то пошло не так"
            subTitle="Попробуйте обновить страницу."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Обновить
              </Button>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

