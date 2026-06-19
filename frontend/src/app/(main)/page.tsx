'use client';

import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';
import { PageLoader } from '@/components/ui/page-loader';

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader fullScreen variant="app-shell" />}>
      <Dashboard />
    </Suspense>
  );
}
