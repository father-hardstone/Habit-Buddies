import { Suspense } from 'react';
import { ResetPasswordForm } from './reset-password-form';
import { AuthFormSkeleton } from '@/components/ui/skeleton-loaders';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
