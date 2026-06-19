'use client';

import Link from 'next/link';
import * as React from 'react';
import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  useEmailValidation,
} from '@/components/auth/auth-form';
import { useAuth, type AuthActionOptions } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api-client';

type SignupFormProps = {
  options?: AuthActionOptions;
  onSuccess?: () => void | Promise<void>;
  loginHref?: string;
  showLoginLink?: boolean;
  showDemoTip?: boolean;
};

export function SignupForm({
  options,
  onSuccess,
  loginHref = '/login',
  showLoginLink = true,
  showDemoTip = true,
}: SignupFormProps) {
  const { register } = useAuth();
  const [name, setName] = React.useState('');
  const { email, setEmail, isValid: isValidEmail } = useEmailValidation('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    name.trim().length >= 2 &&
    isValidEmail &&
    password.length >= 8 &&
    passwordsMatch;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email, password, options);
      await onSuccess?.();
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Sign up failed. Please try again.',
      );
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <AuthField
        id="name"
        label="Full name"
        value={name}
        onChange={setName}
        placeholder="Alex Johnson"
        disabled={isLoading}
        autoComplete="name"
      />
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
      <AuthField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 8 characters"
        disabled={isLoading}
        autoComplete="new-password"
      />
      <AuthField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Repeat your password"
        disabled={isLoading}
        autoComplete="new-password"
        error={
          confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined
        }
      />

      <AuthError message={error} />

      <AuthSubmitButton
        type="submit"
        loading={isLoading}
        loadingText="Creating account..."
        disabled={!canSubmit}
      >
        Create account
      </AuthSubmitButton>

      {showLoginLink && (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={loginHref} prefetch className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      )}

      {showDemoTip && (
        <p className="text-center text-xs text-muted-foreground">
          Tip: use a demo email like{' '}
          <span className="font-medium">ibrahim@email.com</span> to load sample groups.
        </p>
      )}
    </form>
  );
}
