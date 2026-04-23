import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import type { AuthContextValue } from '../../context/AuthContext'
import { ApiRequestError } from '../../api/http'
import RegisterPage from '../../pages/public/RegisterPage'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderRegister(auth: Partial<AuthContextValue> | null = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<div>login page</div>} />
      <Route path="/parent/children" element={<LocationProbe />} />
      <Route path="/helper/announcements" element={<LocationProbe />} />
    </Routes>,
    { initialEntries: ['/register'], auth },
  )
}

describe('RegisterPage', () => {
  it('renders register form', () => {
    const { container } = renderRegister()

    expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(2)
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument()
  })

  it('submits valid registration data', async () => {
    const user = userEvent.setup()
    const register = vi.fn().mockResolvedValue(undefined)
    const { container } = renderRegister({ register })
    const passwords = container.querySelectorAll('input[type="password"]')

    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: 'new@test.local' },
    })
    fireEvent.change(container.querySelector('input[type="text"]')!, {
      target: { value: 'New Parent' },
    })
    fireEvent.change(passwords[0], { target: { value: 'Password123!' } })
    fireEvent.change(passwords[1], { target: { value: 'Password123!' } })
    await user.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(
        'new@test.local',
        'Password123!',
        'New Parent',
        'parent',
      )
    })
  })

  it('redirects already authenticated user to role home', async () => {
    renderRegister({
      user: testUsers.helper,
      role: 'helper',
      token: 'helper-token',
      isAuthenticated: true,
    })

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/helper/announcements')
    })
  })

  it('shows registration error', async () => {
    const user = userEvent.setup()
    const register = vi
      .fn()
      .mockRejectedValue(new ApiRequestError('Email already registered', 400))
    const { container } = renderRegister({ register })
    const passwords = container.querySelectorAll('input[type="password"]')

    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: 'used@test.local' },
    })
    fireEvent.change(container.querySelector('input[type="text"]')!, {
      target: { value: 'Used User' },
    })
    fireEvent.change(passwords[0], { target: { value: 'Password123!' } })
    fireEvent.change(passwords[1], { target: { value: 'Password123!' } })
    await user.click(container.querySelector('button[type="submit"]')!)

    expect(await screen.findByText('Email already registered')).toBeInTheDocument()
  })
})
