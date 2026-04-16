import { apiRequest } from './http'

export type UserRole = 'parent' | 'helper' | 'admin'

export type UserResponse = {
  id: number
  name: string
  email: string
  role: UserRole
}

export async function getParents(token: string): Promise<UserResponse[]> {
  return apiRequest<UserResponse[]>('/api/users/parents', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getHelpers(token: string): Promise<UserResponse[]> {
  return apiRequest<UserResponse[]>('/api/users/helpers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateUserRole(
  token: string,
  id: number,
  role: UserRole,
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/users/${id}/role`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  })
}

