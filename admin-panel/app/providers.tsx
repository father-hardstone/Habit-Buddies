'use client';

import { AdminAuthProvider } from '@/hooks/use-admin-auth';

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
