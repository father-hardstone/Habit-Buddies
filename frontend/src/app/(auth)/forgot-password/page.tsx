'use client';

import Link from 'next/link';
import * as React from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  AuthSuccess,
  useEmailValidation,
} from '@/components/auth/auth-form';
import { forgotPasswordRequest } from '@/lib/auth-api';
import { ApiError } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const { email, setEmail, isValid: isValidEmail } = useEmailValidation('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [devResetUrl, setDevResetUrl] = React.useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setDevResetUrl('');

    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPasswordRequest(email);
      setSuccess(result.message);
      if (result.resetUrl) {
        setDevResetUrl(result.resetUrl);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      showTabs={false}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          disabled={isLoading}
          autoComplete="email"
          error={!isValidEmail && email ? 'Invalid email address' : undefined}
        />

        <AuthError message={error} />
        <AuthSuccess message={success} />

        {devResetUrl && (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
            <p className="font-medium text-muted-foreground">Dev reset link:</p>
            <Link
              href={`/reset-password?token=${new URL(devResetUrl).searchParams.get('token')}`}
              prefetch
              className="break-all text-primary hover:underline"
            >
              Open reset page
            </Link>
          </div>
        )}

        <AuthSubmitButton
          type="submit"
          loading={isLoading}
          loadingText="Sending..."
          disabled={!isValidEmail || !email}
        >
          Send reset link
        </AuthSubmitButton>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" prefetch className="font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
