import type { Chat, MessageStatus } from '@/lib/database';
import { formatChatListTime } from '@/lib/chat-time';

export type ChatPreviewMeta = {
  senderId: string;
  status?: MessageStatus;
};

export type ChatInboxUpdate = {
  chatId: string;
  latestMessage: string;
  timestamp: string;
  senderId: string;
};

function previewFields(
  update: ChatInboxUpdate,
  currentUserId: string,
): Pick<Chat, 'lastMessageSenderId' | 'lastMessageStatus'> {
  const isMine = update.senderId === currentUserId;

  return {
    lastMessageSenderId: update.senderId,
    lastMessageStatus: isMine ? 'sent' : null,
  };
}

export function applyInboxUpdate(
  chats: Chat[],
  update: ChatInboxUpdate,
  currentUserId: string,
  selectedChatId: string | null,
): Chat[] {
  const index = chats.findIndex((chat) => chat.id === update.chatId);
  if (index === -1) {
    return chats;
  }

  const existing = chats[index];
  const isIncoming = update.senderId !== currentUserId;
  const isSelected = update.chatId === selectedChatId;

  const updated: Chat = {
    ...existing,
    latestMessage: update.latestMessage,
    timestamp: update.timestamp,
    formattedTimestamp: formatChatListTime(update.timestamp),
    ...previewFields(update, currentUserId),
    unreadCount:
      isIncoming && !isSelected
        ? existing.unreadCount + 1
        : isSelected
          ? 0
          : existing.unreadCount,
  };

  const rest = chats.filter((_, i) => i !== index);
  return [updated, ...rest].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function applyInboxPeerRead(
  chats: Chat[],
  chatId: string,
  readAt: string,
  currentUserId: string,
): Chat[] {
  const readTime = new Date(readAt).getTime();

  return chats.map((chat) => {
    if (chat.id !== chatId) {
      return chat;
    }

    if (
      chat.lastMessageSenderId !== currentUserId ||
      new Date(chat.timestamp).getTime() > readTime
    ) {
      return chat;
    }

    return { ...chat, lastMessageStatus: 'read' satisfies MessageStatus };
  });
}

export function clearChatUnread(chats: Chat[], chatId: string): Chat[] {
  return chats.map((chat) =>
    chat.id === chatId ? { ...chat, unreadCount: 0 } : chat,
  );
}

export function bumpChatPreview(
  chats: Chat[],
  chatId: string,
  latestMessage: string,
  timestamp: string,
  meta: ChatPreviewMeta,
): Chat[] {
  const index = chats.findIndex((chat) => chat.id === chatId);
  if (index === -1) {
    return chats;
  }

  const updated: Chat = {
    ...chats[index],
    latestMessage,
    timestamp,
    formattedTimestamp: formatChatListTime(timestamp),
    lastMessageSenderId: meta.senderId,
    lastMessageStatus: meta.status ?? null,
    unreadCount: 0,
  };

  const rest = chats.filter((_, i) => i !== index);
  return [updated, ...rest].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function updateChatListStatus(
  chats: Chat[],
  chatId: string,
  status: MessageStatus,
  currentUserId: string,
): Chat[] {
  return chats.map((chat) => {
    if (chat.id !== chatId || chat.lastMessageSenderId !== currentUserId) {
      return chat;
    }

    if (chat.lastMessageStatus === 'read') {
      return chat;
    }

    return { ...chat, lastMessageStatus: status };
  });
}
