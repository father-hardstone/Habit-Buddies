'use client';

import { SidebarLayout } from '@/components/sidebar-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { ChatsProvider } from '@/components/chats/chats-context';
import { CallProvider } from '@/context/call-provider';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ChatsProvider>
        <CallProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </CallProvider>
      </ChatsProvider>
    </ProtectedRoute>
  );
}
