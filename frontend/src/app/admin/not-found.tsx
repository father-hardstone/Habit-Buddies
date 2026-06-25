'use client';

import { ErrorScreen } from '@/components/errors/error-screen';

export default function AdminNotFound() {
  return (
    <ErrorScreen
      compact
      title="Admin page not found"
      message="This admin page does not exist."
      homeHref="/admin"
      homeLabel="Back to admin overview"
    />
  );
}
