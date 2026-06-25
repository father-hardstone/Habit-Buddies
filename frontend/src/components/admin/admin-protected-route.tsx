'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminShellSkeleton } from '@/components/ui/skeleton-loaders';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading, isLoggingOut } = useAdminAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !admin && !isLoggingOut) {
      router.replace('/admin/login');
    }
  }, [admin, isLoading, isLoggingOut, router]);

  if (isLoading || isLoggingOut) {
    return <AdminShellSkeleton />;
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
