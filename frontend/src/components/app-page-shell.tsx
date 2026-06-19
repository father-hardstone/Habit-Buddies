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
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>
      {children}
    </div>
  );
}
