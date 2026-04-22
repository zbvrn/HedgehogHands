import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#8ba2c3',
              colorLink: '#6f89ad',
              borderRadius: 8,
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            },
            components: {
              Button: {
                primaryShadow: 'none',
              },
              Table: {
                headerBg: '#f4f7fb',
                headerColor: '#173d61',
                rowHoverBg: '#f8fbff',
              },
              Tabs: {
                itemSelectedColor: '#173d61',
                inkBarColor: '#8ba2c3',
              },
            },
          }}
        >
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
