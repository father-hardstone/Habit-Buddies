'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  AuthSuccess,
} from '@/components/auth/auth-form';
import { resetPasswordRequest } from '@/lib/auth-api';
import { ApiError } from '@/lib/api-client';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const passwordsMatch = password === confirmPassword;
  const canSubmit = token.length >= 32 && password.length >= 8 && passwordsMatch;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Request a new one.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordRequest(token, password);
      setSuccess(result.message);
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Reset failed. The link may have expired.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid link"
        subtitle="This password reset link is missing or invalid."
        showTabs={false}
      >
        <div className="space-y-4">
          <AuthError message="Please request a new password reset link." />
          <Link href="/forgot-password" prefetch className="block">
            <AuthSubmitButton>Request new link</AuthSubmitButton>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      showTabs={false}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthField
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          disabled={isLoading}
          autoComplete="new-password"
        />
        <AuthField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat your password"
          disabled={isLoading}
          autoComplete="new-password"
          error={
            confirmPassword && !passwordsMatch
              ? 'Passwords do not match'
              : undefined
          }
        />

        <AuthError message={error} />
        <AuthSuccess message={success} />

        <AuthSubmitButton
          type="submit"
          loading={isLoading}
          loadingText="Updating..."
          disabled={!canSubmit}
        >
          Update password
        </AuthSubmitButton>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" prefetch className="font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
