import { screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import RequireAuth from '../../components/RequireAuth'
import RequireRole from '../../components/RequireRole'
import LoginPage from '../../pages/public/LoginPage'
import RegisterPage from '../../pages/public/RegisterPage'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

function LocationProbe({ label = 'protected' }: { label?: string }) {
  const location = useLocation()
  return (
    <div>
      <span>{label}</span>
      <span data-testid="location">{location.pathname}</span>
    </div>
  )
}

describe('Route protection', () => {
  it.each(['/parent/children', '/helper/announcements', '/admin/categories'])(
    'redirects unauthenticated user from %s to login',
    async (path) => {
      renderWithProviders(
        <Routes>
          <Route path="/login" element={<LocationProbe label="login" />} />
          <Route
            path={path}
            element={
              <RequireAuth>
                <LocationProbe />
              </RequireAuth>
            }
          />
        </Routes>,
        { initialEntries: [path], auth: { token: null, isAuthenticated: false } },
      )

      expect(await screen.findByText('login')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/login')
    },
  )

  it('allows authenticated user to protected route with matching role', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/parent/children"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={['parent']}>
                <LocationProbe />
              </RequireRole>
            </RequireAuth>
          }
        />
      </Routes>,
      {
        initialEntries: ['/parent/children'],
        auth: { user: testUsers.parent, role: 'parent', token: 'token' },
      },
    )

    expect(screen.getByText('protected')).toBeInTheDocument()
  })

  it('public login and register routes are available without token', () => {
    const { rerender } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { initialEntries: ['/login'], auth: { token: null, isAuthenticated: false } },
    )

    expect(document.querySelector('input[type="email"]')).toBeInTheDocument()

    rerender(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
    )
  })
})
