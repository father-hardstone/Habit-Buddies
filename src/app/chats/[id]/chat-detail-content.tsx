'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { ChatView } from '@/components/chat-view';
import { getChatById } from '@/lib/database';
import { notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';

function ChatDetailPageContent({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const chat = getChatById(chatId, user!.id);

  if (!chat) {
    notFound();
  }

  return (
    <SidebarLayout>
      <ChatView chat={chat} />
    </SidebarLayout>
  );
}

export { ChatDetailPageContent };
export default function ChatDetailPageContentWrapper({ chatId }: { chatId: string }) {
  return (
    <ProtectedRoute>
      <ChatDetailPageContent chatId={chatId} />
    </ProtectedRoute>
  );
}
