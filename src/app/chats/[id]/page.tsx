
'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { ChatView } from '@/components/chat-view';
import { getChatById } from '@/lib/database';
import { notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';

function ChatDetailPageContent({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const chat = getChatById(params.id, user!.id);

  if (!chat) {
    notFound();
  }

  return (
    <SidebarLayout>
      <ChatView chat={chat} />
    </SidebarLayout>
  );
}

export default function ChatDetailPage({ params }: { params: { id: string } }) {
    return (
        <ProtectedRoute>
            <ChatDetailPageContent params={params} />
        </ProtectedRoute>
    )
}
