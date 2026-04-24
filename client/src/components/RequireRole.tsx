import type { ReactNode } from 'react'
import type { Role } from '../context/AuthContext'
import { useAuth } from '../context/AuthContext'
import ForbiddenPage from './ForbiddenPage'
import PageLoading from './PageLoading'

type RequireRoleProps = {
  allowedRoles: Role[]
  children: ReactNode
}

function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { role, isAuthReady } = useAuth()

  if (!allowedRoles.length) {
    return children
  }

  if (!isAuthReady) {
    return <PageLoading />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <ForbiddenPage />
  }

  return children
}

export default RequireRole
