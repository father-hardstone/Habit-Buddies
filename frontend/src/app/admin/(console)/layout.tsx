import { AdminShell } from '@/components/admin-shell';
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route';

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </AdminProtectedRoute>
  );
}
