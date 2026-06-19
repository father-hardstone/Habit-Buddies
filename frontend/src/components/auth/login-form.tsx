'use client';

import Link from 'next/link';
import * as React from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  useEmailValidation,
} from '@/components/auth/auth-form';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useAuth, type AuthActionOptions } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api-client';

type LoginFormProps = {
  options?: AuthActionOptions;
  onSuccess?: () => void | Promise<void>;
  signupHref?: string;
  showSignupLink?: boolean;
};

export function LoginForm({
  options,
  onSuccess,
  signupHref = '/signup',
  showSignupLink = true,
}: LoginFormProps) {
  const { login } = useAuth();
  const { email, setEmail, isValid: isValidEmail } = useEmailValidation('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');

    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, options);
      await onSuccess?.();
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed. Please try again.',
      );
    }
  };

  return (
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            prefetch
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      <AuthError message={error} />

      <AuthSubmitButton
        type="submit"
        loading={isLoading}
        loadingText="Signing in..."
        disabled={!isValidEmail || password.length < 8}
      >
        Log in
      </AuthSubmitButton>

      {showSignupLink && (
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={signupHref} prefetch className="font-medium text-primary hover:underline">
            Sign up free
          </Link>
        </p>
      )}
    </form>
  );
}
