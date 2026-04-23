import { screen, waitFor } from '@testing-library/react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import RequireAuth from '../../components/RequireAuth'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'
import { meRequest } from '../../api/auth'

vi.mock('../../api/auth', async () => {
  const actual = await vi.importActual<typeof import('../../api/auth')>('../../api/auth')
  return {
    ...actual,
    meRequest: vi.fn(),
  }
})

function UserProbe() {
  const { user, isAuthenticated } = useAuth()
  return (
    <div>
      <span data-testid="auth-state">{String(isAuthenticated)}</span>
      <span data-testid="user-name">{user?.name ?? 'none'}</span>
    </div>
  )
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('Auth init', () => {
  it('restores user when token exists', async () => {
    vi.mocked(meRequest).mockResolvedValue(testUsers.parent)
    localStorage.setItem('token', 'stored-token')

    renderWithProviders(
      <AuthProvider>
        <UserProbe />
      </AuthProvider>,
      { auth: null },
    )

    await waitFor(() => {
      expect(meRequest).toHaveBeenCalledWith('stored-token')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Parent Test')
    })
  })

  it('keeps protected route unavailable without token', async () => {
    renderWithProviders(
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LocationProbe />} />
          <Route
            path="/parent/children"
            element={
              <RequireAuth>
                <Navigate to="/parent/children" />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>,
      { initialEntries: ['/parent/children'], auth: null },
    )

    expect(await screen.findByTestId('location')).toHaveTextContent('/login')
    expect(meRequest).not.toHaveBeenCalled()
  })
})
