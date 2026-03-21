import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiClient, ApiError } from '../api/client';
import PageLoading from '../components/PageLoading';

export type Role = 'Parent' | 'Helper' | 'Admin';

export type User = {
  id: string;
  email: string;
  displayName: string;
};

type MeResponse = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
};

type TokenResponse = {
  accessToken: string;
};

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const init = async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) return;

    try {
      const me = await apiClient.get<MeResponse>('/api/auth/me');
      setUser({ id: me.id, email: me.email, displayName: me.displayName });
      setRole(me.role);
    } catch (err) {
      if (err instanceof ApiError || err instanceof TypeError) {
        logout();
      }
    }
  };

  useEffect(() => {
    init().finally(() => setIsInitialized(true));
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { accessToken } = await apiClient.post<TokenResponse>('/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    await init();
  };

  const register = async (displayName: string, email: string, password: string) => {
    const { accessToken } = await apiClient.post<TokenResponse>('/api/auth/register', {
      displayName,
      email,
      password,
    });
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    await init();
  };

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
    [user, role, token]
  );

  if (!isInitialized) return <PageLoading />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
