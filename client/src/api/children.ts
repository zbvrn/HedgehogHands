import { apiRequest } from './http'

export type Child = {
  id: number
  name: string
  age: number
  features?: string | null
  parentId: number
  createdAt: string
}

export async function getChildren(token: string): Promise<Child[]> {
  return apiRequest<Child[]>('/api/children', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getChildById(token: string, id: number): Promise<Child> {
  return apiRequest<Child>(`/api/children/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createChild(
  token: string,
  payload: { name: string; age: number; features?: string },
): Promise<Child> {
  return apiRequest<Child>('/api/children', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function updateChild(
  token: string,
  id: number,
  payload: { name?: string; age?: number; features?: string },
): Promise<Child> {
  return apiRequest<Child>(`/api/children/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function deleteChild(token: string, id: number): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>(`/api/children/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

