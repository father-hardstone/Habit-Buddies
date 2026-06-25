'use client';

import * as React from 'react';
import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  useEmailValidation,
} from '@/components/auth/auth-form';
import { ApiError, useAdminAuth } from '@/hooks/use-admin-auth';

export function AdminLoginForm() {
  const { login } = useAdminAuth();
  const { email, setEmail, isValid: isValidEmail } = useEmailValidation('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await login(email, password);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <AuthField
        id="admin-email"
        label="Admin email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="admin@habitbuddies.com"
        disabled={isLoading}
        autoComplete="username"
      />
      <AuthField
        id="admin-password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
        disabled={isLoading}
        autoComplete="current-password"
      />
      <AuthError message={error} />
      <AuthSubmitButton
        loading={isLoading}
        loadingText="Signing in..."
        disabled={isLoading || !isValidEmail || password.length < 8}
        type="submit"
      >
        Sign in to admin
      </AuthSubmitButton>
    </form>
  );
}
