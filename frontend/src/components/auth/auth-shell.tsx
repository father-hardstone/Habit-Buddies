'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useLinkStatus } from 'next/link';
import { ArrowLeft, CheckCircle2, Smile, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'] as const;

const tabs = [
  { href: '/login', label: 'Log in' },
  { href: '/signup', label: 'Sign up' },
] as const;

const highlights = [
  { icon: Users, text: 'Join groups and stay accountable together' },
  { icon: Sparkles, text: 'AI-powered motivation when you need a boost' },
  { icon: CheckCircle2, text: 'Track streaks and celebrate every win' },
];

function AuthTabLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        'rounded-lg py-2.5 text-center text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <AuthTabLabel label={label} />
    </Link>
  );
}

function AuthTabLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  if (pending) {
    return (
      <>
        <Skeleton className="size-3.5 rounded-sm" />
        <span>{label}</span>
      </>
    );
  }

  return <span>{label}</span>;
}

export function AuthShell({
  children,
  title,
  subtitle,
  showTabs = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTabs?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    AUTH_ROUTES.forEach((route) => router.prefetch(route));
  }, [router]);

  const isResetFlow =
    pathname === '/forgot-password' || pathname === '/reset-password';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent p-10 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <Link
          href="/welcome"
          prefetch
          className="relative z-10 inline-flex items-center gap-2.5 w-fit rounded-lg px-2 py-1 transition-opacity hover:opacity-90"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Smile className="size-6" />
          </div>
          <span className="text-2xl font-bold font-headline">Habit Buddies</span>
        </Link>

        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <h2 className="text-3xl font-bold font-headline leading-tight">
              Build habits that stick — together.
            </h2>
            <p className="mt-3 text-primary-foreground/85 text-lg">
              Your community, your streaks, your progress — all in one place.
            </p>
          </div>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-4" />
                </span>
                <span className="text-primary-foreground/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Habit Buddies
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-14">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between">
            <Link
              href="/welcome"
              prefetch
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <Link href="/welcome" prefetch className="inline-flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Smile className="size-4" />
              </div>
              <span className="font-bold font-headline">Habit Buddies</span>
            </Link>
          </div>

          <div className="space-y-2">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {showTabs && !isResetFlow && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              {tabs.map((tab) => (
                <AuthTabLink
                  key={tab.href}
                  href={tab.href}
                  label={tab.label}
                  isActive={pathname === tab.href}
                />
              ))}
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
