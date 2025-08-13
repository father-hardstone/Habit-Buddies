
import { SidebarLayout } from '@/components/sidebar-layout';
import { ChatView } from '@/components/chat-view';
import { getChat } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const chat = getChat(params.id);

  if (!chat) {
    notFound();
  }

  return (
    <SidebarLayout>
      <ChatView chat={chat} />
    </SidebarLayout>
  );
}
