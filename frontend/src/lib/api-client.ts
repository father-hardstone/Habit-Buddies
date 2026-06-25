const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4532/api';
const TOKEN_KEY = 'accessToken';
const ADMIN_TOKEN_KEY = 'adminAccessToken';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function fetchJson<T>(
  path: string,
  options: RequestInit,
  token: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      'Cannot reach the API server. Start the backend with: npm run dev:backend',
    );
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(', ')
          : 'Request failed';

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchJson<T>(path, options, getAccessToken());
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(
      0,
      'Cannot reach the API server. Start the backend with: npm run dev:backend',
    );
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(', ')
          : 'Upload failed';
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchJson<T>(path, options, getAdminToken());
}

export async function publicFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchJson<T>(path, options, null);
}
