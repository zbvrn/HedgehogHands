import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Role = 'Parent' | 'Helper' | 'Admin';

export type User = {
  id: string;
  displayName: string;
};

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, role: Role) => void;
  logout: () => void;
  init: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const login = useCallback((nextToken: string, nextUser: User, nextRole: Role) => {
    setToken(nextToken);
    setUser(nextUser);
    setRole(nextRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setRole(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const init = useCallback(() => {
    // Placeholder for /api/auth/me in a future lab.
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      init,
    }),
    [user, role, token, login, logout, init]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
