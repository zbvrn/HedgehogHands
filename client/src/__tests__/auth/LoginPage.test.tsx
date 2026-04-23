import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import type { AuthContextValue } from '../../context/AuthContext'
import { ApiRequestError } from '../../api/http'
import LoginPage from '../../pages/public/LoginPage'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderLogin(auth: Partial<AuthContextValue> | null = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<div>register page</div>} />
      <Route path="/parent/children" element={<LocationProbe />} />
      <Route path="/helper/announcements" element={<LocationProbe />} />
      <Route path="/admin/parents" element={<LocationProbe />} />
    </Routes>,
    { initialEntries: ['/login'], auth },
  )
}

describe('LoginPage', () => {
  it('renders login form', () => {
    const { container } = renderLogin()

    expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/register')
  })

  it('submits email and password to login', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)
    const { container } = renderLogin({ login })

    const email = container.querySelector('input[type="email"]')!
    const password = container.querySelector('input[type="password"]')!
    await user.clear(email)
    await user.type(email, 'parent@test.local')
    await user.type(password, 'Password123!')
    await user.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('parent@test.local', 'Password123!')
    })
  })

  it.each([
    ['parent', '/parent/children'],
    ['helper', '/helper/announcements'],
    ['admin', '/admin/parents'],
  ] as const)('redirects authenticated %s to role home', async (role, expectedPath) => {
    renderLogin({ user: testUsers[role], role, token: `${role}-token`, isAuthenticated: true })

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(expectedPath)
    })
  })

  it('shows validation error after failed login', async () => {
    const user = userEvent.setup()
    const login = vi
      .fn()
      .mockRejectedValue(new ApiRequestError('Invalid email or password', 401))
    const { container } = renderLogin({ login })

    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: 'parent@test.local' },
    })
    fireEvent.change(container.querySelector('input[type="password"]')!, {
      target: { value: 'wrong-password' },
    })
    await user.click(container.querySelector('button[type="submit"]')!)

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  })
})
