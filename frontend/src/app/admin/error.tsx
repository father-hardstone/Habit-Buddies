'use client';

import { RouteError } from '@/components/errors/route-error';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Admin panel error"
      homeHref="/admin/dashboard"
      homeLabel="Back to admin dashboard"
    />
  );
}
