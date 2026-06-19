'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';

function SignupPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? undefined;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Habit Buddies and start building better habits today."
    >
      <SignupForm options={{ redirectTo }} />
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageContent />
    </Suspense>
  );
}
