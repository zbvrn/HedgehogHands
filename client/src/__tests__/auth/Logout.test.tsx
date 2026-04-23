import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import RequireAuth from '../../components/RequireAuth'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function AuthHarness() {
  const [token, setToken] = useState<string | null>('parent-token')
  const value: AuthContextValue = {
    user: token ? testUsers.parent : null,
    role: token ? 'parent' : null,
    token,
    isAuthenticated: Boolean(token),
    login: async () => undefined,
    register: async () => undefined,
    logout: () => {
      localStorage.removeItem('token')
      setToken(null)
    },
    init: () => undefined,
  }

  return (
    <AuthContext.Provider value={value}>
      <Routes>
        <Route path="/login" element={<LocationProbe />} />
        <Route
          path="/parent/children"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </AuthContext.Provider>
  )
}

describe('Logout', () => {
  it('authorized user sees logout and returns to login after click', async () => {
    const user = userEvent.setup()
    localStorage.setItem('token', 'parent-token')
    const { container } = renderWithProviders(<AuthHarness />, {
      initialEntries: ['/parent/children'],
      auth: null,
    })

    const button = container.querySelector('.sidebar__logout')!
    expect(button).toBeInTheDocument()
    await user.click(button)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(screen.getByTestId('location')).toHaveTextContent('/login')
    })
  })
})
