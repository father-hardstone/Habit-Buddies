
import { SidebarLayout } from '@/components/sidebar-layout';
import { ChatView } from '@/components/chat-view';
import { getChatById } from '@/lib/database';
import { notFound } from 'next/navigation';
import { ChatDetailPageContent } from './chat-detail-content';

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // We can't check user auth here since this is a server component
  // The ProtectedRoute will handle authentication in the client component
  return (
    <ChatDetailPageContent chatId={id} />
  );
}
