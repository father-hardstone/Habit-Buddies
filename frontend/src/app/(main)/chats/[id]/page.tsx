
import { ChatDetailPageContent } from './chat-detail-content';

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ChatDetailPageContent chatId={id} />;
}
