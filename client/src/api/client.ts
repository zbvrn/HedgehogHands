const BASE_URL = ''

export type FieldErrors = Record<string, string[]>

interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: FieldErrors
}

export class ApiError extends Error {
  public readonly status: number
  public readonly fieldErrors?: FieldErrors

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    let fieldErrors: FieldErrors | undefined

    try {
      const problem: ProblemDetails = await response.json()
      message = problem.detail ?? problem.title ?? message
      fieldErrors = problem.errors
    } catch {
      // ignore JSON parse errors
    }

    throw new ApiError(response.status, message, fieldErrors)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
