
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserById, type User } from '@/lib/database';

type AuthUser = NonNullable<User>;

interface AuthContextType {
  user: AuthUser | null;
  login: (userId: number) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'hab-bud-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const userData: AuthUser = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Clear corrupted storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userId: number) => {
    const userToLogin = getUserById(userId);
    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToLogin));
      router.push('/');
    } else {
        // Handle case where user ID is invalid
        console.error("Login failed: User not found");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/welcome');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
