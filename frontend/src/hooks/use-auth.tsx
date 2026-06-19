
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, clearAccessToken, getAccessToken, setAccessToken } from '@/lib/api-client';
import {
  loginRequest,
  meRequest,
  registerRequest,
  type AuthUserResponse,
} from '@/lib/auth-api';

export type AuthUser = AuthUserResponse & {
  username: string;
  profileUrl: string;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (
    email: string,
    password: string,
    options?: string | AuthActionOptions,
  ) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    options?: string | AuthActionOptions,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  isLoading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'authUser';

export type AuthActionOptions = {
  redirectTo?: string;
  skipRedirect?: boolean;
};

function resolveAuthOptions(options?: string | AuthActionOptions): AuthActionOptions {
  if (typeof options === 'string') {
    return { redirectTo: options };
  }
  return options ?? {};
}

function mapAuthUser(user: AuthUserResponse): AuthUser {
  return {
    ...user,
    username: user.name,
    profileUrl: user.avatarUrl ?? 'https://placehold.co/96x96.png',
  };
}

function persistSession(user: AuthUser, accessToken: string) {
  setAccessToken(accessToken);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = getAccessToken();

        if (!token) {
          const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
          if (storedUser) {
            setUser(JSON.parse(storedUser) as AuthUser);
          }
          return;
        }

        const { user: currentUser } = await meRequest();
        const mappedUser = mapAuthUser(currentUser);
        setUser(mappedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
      } catch (error) {
        console.error('Failed to restore session', error);
        clearAccessToken();
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (
    email: string,
    password: string,
    options?: string | AuthActionOptions,
  ) => {
    const { redirectTo, skipRedirect } = resolveAuthOptions(options);
    try {
      const { user: loggedInUser, accessToken } = await loginRequest(email, password);
      const mappedUser = mapAuthUser(loggedInUser);

      setUser(mappedUser);
      persistSession(mappedUser, accessToken);
      if (!skipRedirect) {
        router.replace(redirectTo ?? '/');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Login failed. Please try again.');
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    options?: string | AuthActionOptions,
  ) => {
    const { redirectTo, skipRedirect } = resolveAuthOptions(options);
    try {
      const { user: newUser, accessToken } = await registerRequest(email, password, name);
      const mappedUser = mapAuthUser(newUser);

      setUser(mappedUser);
      persistSession(mappedUser, accessToken);
      if (!skipRedirect) {
        router.replace(redirectTo ?? '/');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Sign up failed. Please try again.');
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    router.replace('/welcome');
    clearAccessToken();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setIsLoggingOut(false);
  };

  const refreshUser = async () => {
    const { user: currentUser } = await meRequest();
    const mappedUser = mapAuthUser(currentUser);
    setUser(mappedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
  };

  const updateUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        isLoading,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
