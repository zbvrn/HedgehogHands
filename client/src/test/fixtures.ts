import type { Announcement, PaginatedResponse } from '../api/announcements'
import type { Category } from '../api/categories'
import type { Child } from '../api/children'
import type { RequestItem } from '../api/requests'
import type { UserResponse } from '../api/users'

export const childFixture: Child = {
  id: 1,
  name: 'Mira',
  age: 7,
  features: 'Calm lessons',
  parentId: 1,
  createdAt: '2026-04-01T10:00:00.000Z',
}

export const categoryFixture: Category = {
  id: 1,
  name: 'Speech therapy',
  isActive: true,
}

export const announcementFixture: Announcement = {
  id: 1,
  title: 'Reading support',
  description: 'Careful reading practice',
  price: 1200,
  category: { id: 1, name: 'Speech therapy' },
  helper: { id: 2, name: 'Helper Test' },
  isActive: true,
  createdAt: '2026-04-01T10:00:00.000Z',
  updatedAt: '2026-04-01T10:00:00.000Z',
}

export const requestFixture: RequestItem = {
  id: 1,
  number: 1,
  status: 'New',
  message: 'Please contact me',
  rejectionReason: null,
  createdAt: '2026-04-01T10:00:00.000Z',
  announcement: {
    id: 1,
    title: 'Reading support',
    helper: { id: 2, name: 'Helper Test' },
    category: { id: 1, name: 'Speech therapy' },
  },
  parent: { id: 1, name: 'Parent Test', email: 'parent@test.local' },
  child: { id: 1, name: 'Mira', age: 7 },
}

export const parentUserFixture: UserResponse = {
  id: 1,
  name: 'Parent Test',
  email: 'parent@test.local',
  role: 'parent',
}

export const helperUserFixture: UserResponse = {
  id: 2,
  name: 'Helper Test',
  email: 'helper@test.local',
  role: 'helper',
}

export function paginated<T>(items: T[]): PaginatedResponse<T> {
  return {
    items,
    total: items.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  }
}
