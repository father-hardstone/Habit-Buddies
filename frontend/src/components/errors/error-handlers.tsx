'use client';

import * as React from 'react';
import { handleAsyncError } from '@/lib/error-utils';

export function ErrorHandlers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleAsyncError(event.reason, {
        title: 'Unexpected error',
        context: 'unhandledrejection',
      });
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
