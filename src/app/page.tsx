
'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Dashboard } from '@/components/dashboard';
import { ProtectedRoute } from '@/components/protected-route';

export default function Home() {
  return (
    <ProtectedRoute>
      <SidebarLayout>
        <Dashboard />
      </SidebarLayout>
    </ProtectedRoute>
  );
}
