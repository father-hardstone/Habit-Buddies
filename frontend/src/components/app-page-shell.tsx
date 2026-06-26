'use client';

import { cn } from '@/lib/utils';

export function AppPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden lg:h-full lg:max-h-full',
        className,
      )}
    >
      {children}
    </div>
  );
}
