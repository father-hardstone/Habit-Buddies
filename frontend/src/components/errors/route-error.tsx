'use client';

import * as React from 'react';
import { ErrorScreen } from '@/components/errors/error-screen';
import { getErrorMessage, showErrorToast } from '@/lib/error-utils';

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  homeHref?: string;
  homeLabel?: string;
};

export function RouteError({
  error,
  reset,
  title = 'Something went wrong',
  homeHref = '/',
  homeLabel = 'Go to dashboard',
}: RouteErrorProps) {
  React.useEffect(() => {
    showErrorToast(error, {
      title: 'Page error',
      fallback: getErrorMessage(error),
    });
  }, [error]);

  return (
    <ErrorScreen
      title={title}
      message={getErrorMessage(error)}
      onRetry={reset}
      homeHref={homeHref}
      homeLabel={homeLabel}
    />
  );
}
