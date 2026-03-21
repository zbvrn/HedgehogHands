import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type RequireAuthProps = {
  children: ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
