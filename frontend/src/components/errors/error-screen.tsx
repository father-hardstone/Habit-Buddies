'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorScreenProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
  onNavigateHome?: () => void;
  className?: string;
  compact?: boolean;
};

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  homeHref = '/',
  homeLabel = 'Go to dashboard',
  onNavigateHome,
  className,
  compact = false,
}: ErrorScreenProps) {
  const router = useRouter();

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }

    router.push(homeHref);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-4 p-6' : 'min-h-[50vh] gap-6 p-8',
        className,
      )}
      role="alert"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-destructive/10 text-destructive',
          compact ? 'size-12' : 'size-16',
        )}
      >
        <AlertTriangle className={compact ? 'size-6' : 'size-8'} />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className={cn('font-bold font-headline', compact ? 'text-lg' : 'text-2xl')}>
          {title}
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">{message}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="size-4" />
            Try again
          </Button>
        )}
        <Button variant="outline" className="gap-2" onClick={handleNavigateHome}>
          <Home className="size-4" />
          {homeLabel}
        </Button>
      </div>
    </div>
  );
}
