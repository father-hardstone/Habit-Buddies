'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Shield,
  Smile,
  Users,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
  { href: '/admin/groups', label: 'Groups', icon: LayoutGrid, exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout, isLoggingOut } = useAdminAuth();
  const [isLogoutPending, setIsLogoutPending] = React.useState(false);

  const handleLogout = () => {
    setIsLogoutPending(true);
    logout();
  };

  return (
    <div className="flex min-h-svh bg-muted/30">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Smile className="size-5" />
            </div>
            <div>
              <p className="font-headline text-sm font-bold">Habit Buddies</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="size-3" />
                Admin
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to app
            </Link>
          </Button>
          <div className="rounded-lg bg-muted/60 px-3 py-2.5">
            <p className="truncate text-sm font-medium">{admin?.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            disabled={isLogoutPending || isLoggingOut}
          >
            <LogOut className="size-4" />
            {isLogoutPending || isLoggingOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
