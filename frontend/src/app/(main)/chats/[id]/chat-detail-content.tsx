'use client';

import { ChatView } from '@/components/chat-view';
import { getChatById, type DetailedChat, type MessageStatus } from '@/lib/database';
import { notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useChatsContext } from '@/components/chats/chats-context';
import { ChatDetailContentSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';
import * as React from 'react';

export function ChatDetailPageContent({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const { updateChatPreview, clearUnread, updateChatListMessageStatus } =
    useChatsContext();
  const [chat, setChat] = React.useState<DetailedChat | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    getChatById(chatId)
      .then((result) => {
        setChat(result);
        if (result) {
          clearUnread(chatId);
        }
      })
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load chat',
          context: 'chats.detail',
        });
      })
      .finally(() => setIsLoading(false));
  }, [chatId, user, clearUnread]);

  const handleChatActivity = React.useCallback(
    (update: {
      latestMessage: string;
      timestamp: string;
      senderId: string;
      status?: MessageStatus;
    }) => {
      updateChatPreview(chatId, update.latestMessage, update.timestamp, {
        senderId: update.senderId,
        status: update.status,
      });
    },
    [chatId, updateChatPreview],
  );

  const handleListStatusChange = React.useCallback(
    (status: MessageStatus) => {
      updateChatListMessageStatus(chatId, status);
    },
    [chatId, updateChatListMessageStatus],
  );

  if (isLoading) {
    return <ChatDetailContentSkeleton />;
  }

  if (!chat || !user) {
    notFound();
  }

  return (
    <ChatView
      chat={chat}
      currentUserId={user.id}
      embedded
      onChatActivity={handleChatActivity}
      onListStatusChange={handleListStatusChange}
    />
  );
}
