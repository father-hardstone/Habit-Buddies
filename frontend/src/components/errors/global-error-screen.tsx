'use client';

import { ErrorScreen } from '@/components/errors/error-screen';
import { getErrorMessage } from '@/lib/error-utils';

type GlobalErrorScreenProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function GlobalErrorScreen({ error, reset }: GlobalErrorScreenProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ErrorScreen
          title="Application error"
          message={getErrorMessage(error, 'A critical error occurred. Please reload the app.')}
          onRetry={reset}
          homeHref="/"
          homeLabel="Go home"
        />
      </body>
    </html>
  );
}
