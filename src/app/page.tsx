import { SidebarLayout } from '@/components/sidebar-layout';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <SidebarLayout>
      <Dashboard />
    </SidebarLayout>
  );
}
