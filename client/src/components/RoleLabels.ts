import type { UserRole } from '../api/users'

export const roleLabels: Record<UserRole, string> = {
  parent: 'Родитель',
  helper: 'Помощник',
  admin: 'Администратор',
}
