import { apiRequest } from './http'

export type Category = {
  id: number
  name: string
  isActive: boolean
}

export async function getCategories(
  token: string,
  includeInactive = false,
): Promise<Category[]> {
  const query = includeInactive ? '?includeInactive=true' : ''
  return apiRequest<Category[]>(`/api/categories${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createCategory(
  token: string,
  name: string,
): Promise<Category> {
  return apiRequest<Category>('/api/categories', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  })
}

export async function updateCategory(
  token: string,
  id: number,
  name: string,
): Promise<Category> {
  return apiRequest<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  })
}

export async function setCategoryActive(
  token: string,
  id: number,
  isActive: boolean,
): Promise<Category> {
  return apiRequest<Category>(`/api/categories/${id}/active`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  })
}

