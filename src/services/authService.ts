/**
 * Autenticação JWT via Plone REST API (++api++/@login)
 */
import { BASE_URL } from '@/services/ploneConfig';

const TOKEN_KEY = 'ufac_editais_jwt';
const USER_KEY = 'ufac_editais_user';

/**
 * Cookie dummy para o Varnish do www3: ele só faz bypass de cache com `__ac`,
 * e ignora Authorization Bearer — senão GETs autenticados recebem listagem anônima
 * (sem pastas private).
 */
const VARNISH_BYPASS_COOKIE = '__ac=ufac-editais; path=/; SameSite=Lax';

const setVarnishBypassCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = VARNISH_BYPASS_COOKIE;
};

const clearVarnishBypassCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = '__ac=; path=/; Max-Age=0; SameSite=Lax';
};

export type AuthUser = {
  id: string;
  username: string;
  fullname?: string;
  email?: string;
  roles?: string[];
};

export type LoginResponse = {
  token: string;
};

export class AuthError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token: string) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  setVarnishBypassCookie();
};

export const clearAccessToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  clearVarnishBypassCookie();
};

/** Garante cookie de bypass se já houver JWT (ex.: refresh da página). */
export const ensureAuthCookies = () => {
  if (getAccessToken()) setVarnishBypassCookie();
};

export const getCachedUser = (): AuthUser | null => {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const setCachedUser = (user: AuthUser) => {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Decodifica payload do JWT (sem validar assinatura — só para ler o sub) */
export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const login = async (username: string, password: string): Promise<string> => {
  const response = await fetch(`${BASE_URL}/@login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login: username.trim(), password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      (response.status === 401
        ? 'Usuário ou senha inválidos.'
        : 'Não foi possível autenticar.');
    throw new AuthError(message, response.status);
  }

  const token = data.token as string | undefined;
  if (!token) {
    throw new AuthError('Resposta de login sem token.');
  }

  setAccessToken(token);
  return token;
};

export const renewToken = async (): Promise<string | null> => {
  const current = getAccessToken();
  if (!current) return null;

  const response = await fetch(`${BASE_URL}/@login-renew`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${current}`,
    },
  });

  if (!response.ok) {
    clearAccessToken();
    return null;
  }

  const data = await response.json().catch(() => ({}));
  const token = (data.token as string) || current;
  setAccessToken(token);
  return token;
};

export const logout = async (): Promise<void> => {
  const token = getAccessToken();
  if (token) {
    try {
      await fetch(`${BASE_URL}/@logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // logout local mesmo se o servidor falhar
    }
  }
  clearAccessToken();
};

/**
 * Solicita e-mail de redefinição de senha (Plone REST API).
 * POST /@users/{userid}/reset-password
 */
export const requestPasswordReset = async (userid: string): Promise<void> => {
  const id = userid.trim();
  if (!id) {
    throw new AuthError('Informe o nome de usuário.');
  }

  const response = await fetch(
    `${BASE_URL}/@users/${encodeURIComponent(id)}/reset-password`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{}',
    }
  );

  if (response.ok || response.status === 204) {
    return;
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new AuthError(
      'Não encontramos esse usuário, ou a conta não permite redefinir senha por aqui (ex.: LDAP).',
      404
    );
  }

  const message =
    data?.error?.message ||
    data?.message ||
    'Não foi possível solicitar a redefinição de senha.';
  throw new AuthError(message, response.status);
};

export const fetchCurrentUser = async (token?: string): Promise<AuthUser> => {
  const accessToken = token || getAccessToken();
  if (!accessToken) {
    throw new AuthError('Não autenticado.', 401);
  }

  const payload = decodeJwtPayload(accessToken);
  const username = String(payload?.sub || payload?.username || '');

  if (!username) {
    throw new AuthError('Token sem identificação de usuário.');
  }

  const response = await fetch(
    `${BASE_URL}/@users/${encodeURIComponent(username)}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    // Fallback mínimo com dados do JWT
    const fallback: AuthUser = {
      id: username,
      username,
      fullname: String(payload?.fullname || username),
    };
    setCachedUser(fallback);
    return fallback;
  }

  const data = await response.json();
  const user: AuthUser = {
    id: data.id || username,
    username: data.username || username,
    fullname: data.fullname || data.fullname || username,
    email: data.email,
    roles: Array.isArray(data.roles) ? data.roles : undefined,
  };
  setCachedUser(user);
  return user;
};
