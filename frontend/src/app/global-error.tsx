'use client';

import { GlobalErrorScreen } from '@/components/errors/global-error-screen';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GlobalErrorScreen error={error} reset={reset} />;
}
