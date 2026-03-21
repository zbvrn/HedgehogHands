import type { ReactNode } from 'react'
import type { Role } from '../contexts/AuthContext'
import { useAuth } from '../contexts/AuthContext'
import ForbiddenPage from './ForbiddenPage'

type RequireRoleProps = {
  allowedRoles: Role[]
  children: ReactNode
}

function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { role } = useAuth()

  if (!allowedRoles.length) {
    return children
  }

  if (!role || !allowedRoles.includes(role)) {
    return <ForbiddenPage />
  }

  return children
}

export default RequireRole
