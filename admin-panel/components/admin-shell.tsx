'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/dashboard/users', label: 'Users' },
  { href: '/admin/dashboard/groups', label: 'Groups' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout, isLoggingOut } = useAdminAuth();
  const [isLogoutPending, setIsLogoutPending] = React.useState(false);

  React.useEffect(() => {
    if (!admin) {
      router.replace('/admin/login');
    }
  }, [admin, router]);

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Checking admin session...
      </div>
    );
  }

  const handleLogout = () => {
    setIsLogoutPending(true);
    logout();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/80 p-6 flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
            Habit Buddies
          </p>
          <h1 className="text-xl font-bold mt-1">Admin Panel</h1>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-zinc-800 pt-4">
          <div className="text-sm">
            <p className="font-medium">{admin.email}</p>
            <p className="text-zinc-500 text-xs">Administrator</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLogoutPending || isLoggingOut}
            className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            {isLogoutPending || isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
