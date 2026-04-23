import type { ReactElement, ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  AuthContext,
  type AuthContextValue,
  type Role,
  type User,
} from '../context/AuthContext'

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  initialEntries?: string[]
  auth?: Partial<AuthContextValue> | null
}

export const testUsers: Record<Role, User> = {
  parent: {
    id: 1,
    email: 'parent@test.local',
    name: 'Parent Test',
    role: 'parent',
  },
  helper: {
    id: 2,
    email: 'helper@test.local',
    name: 'Helper Test',
    role: 'helper',
  },
  admin: {
    id: 3,
    email: 'admin@test.local',
    name: 'Admin Test',
    role: 'admin',
  },
}

export function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  const user = overrides.user ?? null
  const role = overrides.role ?? user?.role ?? null
  const token = overrides.token ?? (user ? 'test-token' : null)

  return {
    user,
    role,
    token,
    isAuthenticated: Boolean(token),
    login: async () => undefined,
    register: async () => undefined,
    logout: () => undefined,
    init: () => undefined,
    ...overrides,
  }
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    auth = {},
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    const content = (
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </ConfigProvider>
      </QueryClientProvider>
    )

    if (auth === null) {
      return content
    }

    return (
      <AuthContext.Provider value={createAuthValue(auth)}>
        {content}
      </AuthContext.Provider>
    )
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}
