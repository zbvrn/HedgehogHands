import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const TOKEN_STORAGE_KEY = 'token'

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

type RequireAuthProps = {
  children: ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const { token } = useAuth()
  const hasToken = Boolean(token ?? getStoredToken())

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
