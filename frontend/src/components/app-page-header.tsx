'use client';

import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';

type AppPageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function AppPageHeader({
  title,
  description,
  children,
  className,
}: AppPageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 flex-col gap-4 border-b bg-background/95 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:flex-row md:items-center md:justify-between md:p-6',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="shrink-0 md:hidden" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold font-headline tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
          {children}
        </div>
      )}
    </header>
  );
}
