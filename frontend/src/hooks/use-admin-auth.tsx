'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  adminLogin,
  adminMe,
  type AdminUser,
} from '@/lib/admin-api';
import {
  ApiError,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from '@/lib/api-client';

type AdminAuthContextType = {
  admin: AdminUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = React.createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = getAdminToken();
        if (!token) return;
        const { admin: currentAdmin } = await adminMe();
        setAdmin(currentAdmin);
      } catch {
        clearAdminToken();
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const { admin: loggedInAdmin, accessToken } = await adminLogin(email, password);
    setAdminToken(accessToken);
    setAdmin(loggedInAdmin);
    router.replace('/admin');
  };

  const logout = () => {
    setIsLoggingOut(true);
    clearAdminToken();
    setAdmin(null);
    router.replace('/admin/login');
    setIsLoggingOut(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, isLoading, isLoggingOut, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

export { ApiError };
