/**
 * Cliente HTTP shared para a API Plone (++api++), com Bearer JWT quando logado.
 */
import { getAccessToken } from '@/services/authService';
import { BASE_URL } from '@/services/ploneConfig';

export type ApiFetchOptions = RequestInit & {
  /** Se false, não envia Authorization mesmo com token */
  auth?: boolean;
};

export const apiFetch = async (
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<Response> => {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const headers = new Headers(initHeaders || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(`${BASE_URL}${normalized}`, {
    ...rest,
    headers,
  });
};

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const response = await apiFetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  return response.json() as Promise<T>;
};
