'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getChatsForUser, type Chat, type MessageStatus } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { useChatInboxRealtime } from '@/hooks/use-chat-inbox-realtime';
import {
  applyInboxPeerRead,
  applyInboxUpdate,
  bumpChatPreview,
  clearChatUnread,
  updateChatListStatus,
  type ChatInboxUpdate,
  type ChatPreviewMeta,
} from '@/lib/chat-list-utils';
import { handleAsyncError } from '@/lib/error-utils';

type ChatsContextValue = {
  chats: Chat[];
  isLoading: boolean;
  selectedChatId: string | null;
  refreshChats: () => Promise<void>;
  selectChat: (chatId: string) => void;
  deselectChat: () => void;
  clearUnread: (chatId: string) => void;
  updateChatPreview: (
    chatId: string,
    latestMessage: string,
    timestamp: string,
    meta: ChatPreviewMeta,
  ) => void;
  updateChatListMessageStatus: (chatId: string, status: MessageStatus) => void;
};

const ChatsContext = React.createContext<ChatsContextValue | null>(null);

export function useChatsContext() {
  const context = React.useContext(ChatsContext);
  if (!context) {
    throw new Error('useChatsContext must be used within ChatsProvider');
  }
  return context;
}

export function useUnreadChatsCount(): number {
  const { chats } = useChatsContext();

  return React.useMemo(
    () => chats.filter((chat) => chat.unreadCount > 0).length,
    [chats],
  );
}

function getSelectedChatId(pathname: string): string | null {
  const match = pathname.match(/^\/chats\/([^/]+)$/);
  return match?.[1] ?? null;
}

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const selectedChatId = getSelectedChatId(pathname);

  const refreshChats = React.useCallback(async () => {
    if (!user) {
      return;
    }

    const next = await getChatsForUser();
    setChats(next);
  }, [user]);

  React.useEffect(() => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    getChatsForUser()
      .then(setChats)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load chats',
          context: 'chats.list',
        });
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  React.useEffect(() => {
    if (!selectedChatId || isLoading) {
      return;
    }

    if (!chats.some((chat) => chat.id === selectedChatId)) {
      void refreshChats();
    }
  }, [selectedChatId, chats, isLoading, refreshChats]);

  React.useEffect(() => {
    if (!selectedChatId) {
      return;
    }

    setChats((prev) => clearChatUnread(prev, selectedChatId));
  }, [selectedChatId]);

  const deselectChat = React.useCallback(() => {
    router.push('/chats');
  }, [router]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !selectedChatId) {
        return;
      }

      event.preventDefault();
      deselectChat();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deselectChat, selectedChatId]);

  const handleInboxUpdate = React.useCallback(
    (update: ChatInboxUpdate) => {
      if (!user) {
        return;
      }

      setChats((prev) =>
        applyInboxUpdate(prev, update, user.id, selectedChatId),
      );
    },
    [selectedChatId, user],
  );

  const handleInboxRead = React.useCallback((chatId: string) => {
    setChats((prev) => clearChatUnread(prev, chatId));
  }, []);

  const handleInboxPeerRead = React.useCallback(
    (payload: { chatId: string; readAt: string }) => {
      if (!user) {
        return;
      }

      setChats((prev) =>
        applyInboxPeerRead(prev, payload.chatId, payload.readAt, user.id),
      );
    },
    [user],
  );

  useChatInboxRealtime(user?.id ?? '', {
    onInboxUpdate: handleInboxUpdate,
    onInboxRead: handleInboxRead,
    onInboxPeerRead: handleInboxPeerRead,
  });

  const selectChat = React.useCallback(
    (chatId: string) => {
      if (selectedChatId === chatId) {
        deselectChat();
        return;
      }

      router.push(`/chats/${chatId}`);
    },
    [deselectChat, router, selectedChatId],
  );

  const clearUnread = React.useCallback((chatId: string) => {
    setChats((prev) => clearChatUnread(prev, chatId));
  }, []);

  const updateChatPreview = React.useCallback(
    (
      chatId: string,
      latestMessage: string,
      timestamp: string,
      meta: ChatPreviewMeta,
    ) => {
      setChats((prev) =>
        bumpChatPreview(prev, chatId, latestMessage, timestamp, meta),
      );
    },
    [],
  );

  const updateChatListMessageStatus = React.useCallback(
    (chatId: string, status: MessageStatus) => {
      if (!user) {
        return;
      }

      setChats((prev) => updateChatListStatus(prev, chatId, status, user.id));
    },
    [user],
  );

  const value = React.useMemo(
    () => ({
      chats,
      isLoading,
      selectedChatId,
      refreshChats,
      selectChat,
      deselectChat,
      clearUnread,
      updateChatPreview,
      updateChatListMessageStatus,
    }),
    [
      chats,
      isLoading,
      selectedChatId,
      refreshChats,
      selectChat,
      deselectChat,
      clearUnread,
      updateChatPreview,
      updateChatListMessageStatus,
    ],
  );

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}
