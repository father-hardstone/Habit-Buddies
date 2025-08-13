
'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { ChatView } from '@/components/chat-view';
import { getChatById } from '@/lib/database';
import { notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';

function ChatDetailPageContent({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  // The params object is not a promise in a client component that's
  // rendered by another client component, so we can access it directly.
  const id = params.id;
  const chat = getChatById(id, user!.id);

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
