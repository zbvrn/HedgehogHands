import { apiRequest } from './http'
import type { PaginatedResponse } from './announcements'

export type RequestStatus = 'New' | 'InProgress' | 'Resolved' | 'Rejected'

export type RequestItem = {
  id: number
  status: RequestStatus
  message?: string | null
  rejectionReason?: string | null
  createdAt: string
  announcement: {
    id: number
    title: string
    helper: { id: number; name: string }
    category: { id: number; name: string }
  }
  parent: { id: number; name: string; email: string }
  child: { id: number; name: string; age: number }
}

export async function getRequests(
  token: string,
  params: { status?: RequestStatus; page?: number; limit?: number },
): Promise<PaginatedResponse<RequestItem>> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const suffix = query.toString() ? `?${query.toString()}` : ''

  return apiRequest<PaginatedResponse<RequestItem>>(`/api/requests${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getRequestById(token: string, id: number): Promise<RequestItem> {
  return apiRequest<RequestItem>(`/api/requests/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createRequest(
  token: string,
  payload: { announcementId: number; childId: number; message?: string },
): Promise<RequestItem> {
  return apiRequest<RequestItem>('/api/requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

