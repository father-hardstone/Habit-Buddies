'use client';

import { ChatView } from '@/components/chat-view';
import { getChatById, type Chat, type DetailedChat, type MessageStatus } from '@/lib/database';
import { notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useChatsContext } from '@/components/chats/chats-context';
import { handleAsyncError } from '@/lib/error-utils';
import * as React from 'react';

function chatListItemToDetailedChat(chat: Chat): DetailedChat {
  return {
    id: chat.id,
    name: chat.name,
    avatar: chat.avatar,
    online: chat.online,
    groupName: chat.groupName,
    peerLastReadAt: null,
    messages: [],
  };
}

export function ChatDetailPageContent({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const { chats, updateChatPreview, clearUnread, updateChatListMessageStatus } =
    useChatsContext();
  const listChat = React.useMemo(
    () => chats.find((entry) => entry.id === chatId) ?? null,
    [chatId, chats],
  );
  const [chat, setChat] = React.useState<DetailedChat | null>(
    () => (listChat ? chatListItemToDetailedChat(listChat) : null),
  );

  React.useEffect(() => {
    if (listChat) {
      setChat((current) => {
        if (current?.peerLastReadAt) {
          return current;
        }

        return chatListItemToDetailedChat(listChat);
      });
    }
  }, [listChat]);

  React.useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    getChatById(chatId)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result) {
          setChat(result);
        } else if (!listChat) {
          setChat(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleAsyncError(error, {
            title: 'Could not load chat',
            context: 'chats.detail',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, user]);

  React.useEffect(() => {
    if (!user) {
      return;
    }

    clearUnread(chatId);
  }, [chatId, clearUnread, user]);

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

  if (!user) {
    return null;
  }

  const activeChat = chat ?? (listChat ? chatListItemToDetailedChat(listChat) : null);

  if (!activeChat) {
    notFound();
  }

  return (
    <ChatView
      chat={activeChat}
      currentUserId={user.id}
      embedded
      onChatActivity={handleChatActivity}
      onListStatusChange={handleListStatusChange}
    />
  );
}
