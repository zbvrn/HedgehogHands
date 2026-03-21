export type ApiError = {
  status: number;
  title?: string;
  detail?: string;
};

export class ApiRequestError extends Error {
  status: number;
  detail?: string;
  title?: string;

  constructor(message: string, status: number, detail?: string, title?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.detail = detail;
    this.title = title;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiRequestError('Network error', 0);
  }

  if (!response.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = undefined;
    }
    const message =
      payload?.detail ||
      payload?.title ||
      `Request failed with status ${response.status}`;
    throw new ApiRequestError(
      message,
      response.status,
      payload?.detail,
      payload?.title,
    );
  }

  return (await response.json()) as T;
}
