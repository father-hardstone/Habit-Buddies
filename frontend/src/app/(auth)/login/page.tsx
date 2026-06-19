'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? undefined;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up where you left off.">
      <LoginForm options={{ redirectTo }} />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
