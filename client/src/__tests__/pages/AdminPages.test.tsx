import { screen } from '@testing-library/react'
import CategoriesPage from '../../pages/admin/CategoriesPage'
import ParentsPage from '../../pages/admin/ParentsPage'
import HelpersPage from '../../pages/admin/HelpersPage'
import { getCategories } from '../../api/categories'
import { getHelpers, getParents } from '../../api/users'
import {
  categoryFixture,
  helperUserFixture,
  parentUserFixture,
} from '../../test/fixtures'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

vi.mock('../../api/categories', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  setCategoryActive: vi.fn(),
  deleteCategory: vi.fn(),
}))

vi.mock('../../api/users', () => ({
  getParents: vi.fn(),
  getHelpers: vi.fn(),
  updateUserRole: vi.fn(),
}))

const adminAuth = {
  user: testUsers.admin,
  role: 'admin' as const,
  token: 'admin-token',
}

describe('Admin pages', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockResolvedValue([categoryFixture])
    vi.mocked(getParents).mockResolvedValue([parentUserFixture])
    vi.mocked(getHelpers).mockResolvedValue([helperUserFixture])
  })

  it('CategoriesPage shows categories from API', async () => {
    renderWithProviders(<CategoriesPage />, { auth: adminAuth })

    expect(await screen.findByText('Speech therapy')).toBeInTheDocument()
    expect(getCategories).toHaveBeenCalledWith('admin-token', true)
  })

  it('ParentsPage shows parent users from API', async () => {
    renderWithProviders(<ParentsPage />, { auth: adminAuth })

    expect(await screen.findByText('Parent Test')).toBeInTheDocument()
    expect(screen.getByText('parent@test.local')).toBeInTheDocument()
  })

  it('HelpersPage shows helper users from API', async () => {
    renderWithProviders(<HelpersPage />, { auth: adminAuth })

    expect(await screen.findByText('Helper Test')).toBeInTheDocument()
    expect(screen.getByText('helper@test.local')).toBeInTheDocument()
  })
})
