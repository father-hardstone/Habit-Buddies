
'use client';
import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/page-loader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.replace('/welcome');
    }
  }, [user, isLoading, isLoggingOut, router]);

  if (isLoggingOut) {
    return <PageLoader fullScreen variant="app-shell" />;
  }

  // Only block the shell while auth is first resolving — not on tab changes
  if (isLoading && !user) {
    return <PageLoader fullScreen variant="app-shell" />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
