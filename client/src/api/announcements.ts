import { apiRequest } from './http'

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type Announcement = {
  id: number
  title: string
  description: string
  price?: number | null
  category: { id: number; name: string }
  helper: { id: number; name: string }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getAnnouncements(
  token: string,
  params: { categoryId?: number; search?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<Announcement>> {
  const query = new URLSearchParams()
  if (params.categoryId) query.set('categoryId', String(params.categoryId))
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const suffix = query.toString() ? `?${query.toString()}` : ''

  return apiRequest<PaginatedResponse<Announcement>>(`/api/announcements${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getMyAnnouncements(
  token: string,
  params: { page?: number; limit?: number },
): Promise<PaginatedResponse<Announcement>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const suffix = query.toString() ? `?${query.toString()}` : ''

  return apiRequest<PaginatedResponse<Announcement>>(`/api/announcements/my${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getAnnouncementById(token: string, id: number): Promise<Announcement> {
  return apiRequest<Announcement>(`/api/announcements/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createAnnouncement(
  token: string,
  payload: {
    title: string
    description: string
    price?: number
    categoryId: number
  },
): Promise<Announcement> {
  return apiRequest<Announcement>('/api/announcements', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export async function updateAnnouncement(
  token: string,
  id: number,
  payload: {
    title?: string
    description?: string
    price?: number | null
    categoryId?: number
    isActive?: boolean
  },
): Promise<Announcement> {
  return apiRequest<Announcement>(`/api/announcements/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export async function deleteAnnouncement(
  token: string,
  id: number,
): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>(`/api/announcements/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

