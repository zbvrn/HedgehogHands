import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  loginRequest,
  meRequest,
  registerRequest,
  type AuthRole,
  type AuthUser,
  type RegisterRole,
} from '../api/auth'

export type Role = AuthRole

export type User = AuthUser

type AuthContextValue = {
  user: User | null
  role: Role | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: RegisterRole) => Promise<void>
  logout: () => void
  init: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem(TOKEN_STORAGE_KEY)
  })
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  const setSession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken)
    setUser(nextUser)
    setRole(nextUser.role)

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await loginRequest(email, password)
      const currentUser = await meRequest(accessToken)
      setSession(accessToken, currentUser)
    },
    [setSession],
  )

  const register = useCallback(
    async (email: string, password: string, name: string, role: RegisterRole) => {
      const { accessToken } = await registerRequest(email, password, name, role)
      const currentUser = await meRequest(accessToken)
      setSession(accessToken, currentUser)
    },
    [setSession],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setRole(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [])

  const init = useCallback(() => {
    if (!token) {
      return
    }

    meRequest(token)
      .then((currentUser) => {
        setUser(currentUser)
        setRole(currentUser.role)
      })
      .catch(() => {
        logout()
      })
  }, [token, logout])

  useEffect(() => {
    init()
  }, [init])

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      init,
    }),
    [user, role, token, login, register, logout, init],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
