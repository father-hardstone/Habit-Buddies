
import { SidebarLayout } from '@/components/sidebar-layout';
import { ChatView } from '@/components/chat-view';
import { getChatById } from '@/lib/database';
import { notFound } from 'next/navigation';

const CURRENT_USER_ID = 1; // In a real app, this would come from auth

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const chat = getChatById(params.id, CURRENT_USER_ID);

  if (!chat) {
    notFound();
  }

  return (
    <SidebarLayout>
      <ChatView chat={chat} />
    </SidebarLayout>
  );
}
