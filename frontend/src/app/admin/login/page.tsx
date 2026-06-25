'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { AdminLoginSkeleton } from '@/components/ui/skeleton-loaders';
import { useAdminAuth } from '@/hooks/use-admin-auth';

export default function AdminLoginPage() {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && admin) {
      router.replace('/admin');
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return <AdminLoginSkeleton />;
  }

  if (admin) {
    return null;
  }

  return (
    <AuthShell
      title="Admin sign in"
      subtitle="Manage users, groups, and platform data. Admin access only — no public sign up."
      showTabs={false}
    >
      <AdminLoginForm />
    </AuthShell>
  );
}
