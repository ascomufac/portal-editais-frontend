import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthError,
  AuthUser,
  ensureAuthCookies,
  fetchCurrentUser,
  getAccessToken,
  getCachedUser,
  login as apiLogin,
  logout as apiLogout,
  renewToken,
} from '@/services/authService';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoading, setIsLoading] = useState(() => Boolean(getAccessToken()));

  const refreshUser = useCallback(async () => {
    const current = getAccessToken();
    if (!current) {
      setUser(null);
      setToken(null);
      return;
    }
    const profile = await fetchCurrentUser(current);
    setUser(profile);
    setToken(current);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const current = getAccessToken();
      if (!current) {
        setIsLoading(false);
        return;
      }

      ensureAuthCookies();

      try {
        // Tenta renovar; se falhar, limpa sessão
        const renewed = await renewToken();
        if (!renewed) {
          if (!cancelled) {
            setUser(null);
            setToken(null);
          }
          return;
        }
        const profile = await fetchCurrentUser(renewed);
        if (!cancelled) {
          setUser(profile);
          setToken(renewed);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const newToken = await apiLogin(username, password);
    const profile = await fetchCurrentUser(newToken);
    setToken(newToken);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};

export { AuthError };
