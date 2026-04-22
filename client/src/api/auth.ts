import { apiRequest } from './http';

export type AuthRole = 'parent' | 'helper' | 'admin';
export type RegisterRole = Exclude<AuthRole, 'admin'>;

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: AuthRole;
};

type AuthTokenResponse = {
  accessToken: string;
};

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(
  email: string,
  password: string,
  name: string,
  role: RegisterRole,
): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function meRequest(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
