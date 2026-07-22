/**
 * Cliente HTTP shared para a API Plone (++api++), com Bearer JWT quando logado.
 */
import { ensureAuthCookies, getAccessToken } from '@/services/authService';
import { BASE_URL } from '@/services/ploneConfig';

export type ApiFetchOptions = RequestInit & {
  /** Se false, não envia Authorization mesmo com token */
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const parseErrorMessage = (data: unknown, status: number): string => {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const err = d.error as Record<string, unknown> | undefined;
    if (err?.message && typeof err.message === 'string') return err.message;
    if (typeof d.message === 'string') return d.message;
    if (Array.isArray(d.message) && d.message[0]) {
      return String((d.message[0] as { message?: string }).message || d.message[0]);
    }
  }
  return `Erro na requisição: ${status}`;
};

export const apiFetch = async (
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<Response> => {
  const { auth = true, headers: initHeaders, ...rest } = options;
  let normalized = endpoint.startsWith('/') || endpoint.startsWith('?')
    ? endpoint
    : `/${endpoint}`;
  if (normalized === '/') {
    normalized = '';
  }
  const headers = new Headers(initHeaders || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      // Varnish do www3 só bypassa cache com cookie __ac (não com Bearer).
      ensureAuthCookies();
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(`${BASE_URL}${normalized}`, {
    ...rest,
    credentials: 'same-origin',
    headers,
  });
};

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const response = await apiFetch(endpoint, options);
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(parseErrorMessage(data, response.status), response.status, data);
  }

  return data as T;
};
