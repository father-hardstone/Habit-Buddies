'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, useAdminAuth } from '@/hooks/use-admin-auth';

export default function AdminLoginPage() {
  const { login, admin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@habitbuddies.com');
  const [password, setPassword] = React.useState('adminpassword123');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && admin) {
      router.replace('/admin/dashboard');
    }
  }, [admin, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof ApiError ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
          Habit Buddies
        </p>
        <h1 className="text-2xl font-bold text-white mt-2">Admin sign in</h1>
        <p className="text-zinc-400 text-sm mt-2">
          Manage users, groups, and platform data.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none focus:border-violet-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            onPointerDown={() => setIsSubmitting(true)}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
