import Dexie, { type Table } from 'dexie';
import { insertMessageInOrder } from '@/lib/chat-message-order';
import type { ChatMessage, MessageReplyTo, MessageStatus } from '@/lib/database';
import type { ChatCallMessage } from '@/lib/call-constants';

export type CachedChatMessage = {
  id: string;
  chatId: string;
  userId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status?: MessageStatus;
  messageType?: 'text' | 'call';
  call?: ChatCallMessage;
  replyTo?: MessageReplyTo;
};

export type ChatCacheMeta = {
  chatId: string;
  userId: string;
  hasMoreOlder: boolean;
  updatedAt: string;
};

class ChatMessageCacheDatabase extends Dexie {
  messages!: Table<CachedChatMessage, string>;
  chatMeta!: Table<ChatCacheMeta, [string, string]>;

  constructor() {
    super('HabitBuddiesChatCache');

    this.version(1).stores({
      messages: 'id, chatId, [chatId+userId], [chatId+userId+createdAt], createdAt',
      chatMeta: '[chatId+userId], chatId, userId',
    });
  }
}

let db: ChatMessageCacheDatabase | null = null;

function getDb(): ChatMessageCacheDatabase | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!db) {
    db = new ChatMessageCacheDatabase();
  }

  return db;
}

function memoryCacheKey(chatId: string, userId: string): string {
  return `${userId}:${chatId}`;
}

const memoryCache = new Map<string, ChatMessage[]>();

export function getMemoryCachedChatMessages(
  chatId: string,
  userId: string,
): ChatMessage[] | null {
  const cached = memoryCache.get(memoryCacheKey(chatId, userId));
  return cached ? [...cached] : null;
}

export function setMemoryCachedChatMessages(
  chatId: string,
  userId: string,
  messages: ChatMessage[],
): void {
  memoryCache.set(memoryCacheKey(chatId, userId), [...messages]);
}

export async function warmChatMessageCache(
  chatId: string,
  userId: string,
): Promise<void> {
  if (memoryCache.has(memoryCacheKey(chatId, userId))) {
    return;
  }

  const cached = await getCachedChatMessages(chatId, userId);
  if (cached.length > 0) {
    setMemoryCachedChatMessages(chatId, userId, cached);
  }
}


export function shouldPersistMessage(message: ChatMessage): boolean {
  return (
    !message.pending &&
    !message.sendFailed &&
    !message.id.startsWith('pending-')
  );
}

export function toCachedMessage(
  message: ChatMessage,
  chatId: string,
  userId: string,
): CachedChatMessage {
  return {
    id: message.id,
    chatId,
    userId,
    senderId: message.senderId,
    text: message.text,
    createdAt: message.createdAt,
    status: message.status,
    messageType: message.messageType,
    call: message.call,
    replyTo: message.replyTo,
  };
}

export function fromCachedMessage(
  cached: CachedChatMessage,
  currentUserId: string,
): ChatMessage {
  return {
    id: cached.id,
    senderId: cached.senderId,
    sender: cached.senderId === currentUserId ? 'me' : 'other',
    text: cached.text,
    createdAt: cached.createdAt,
    status: cached.status,
    messageType: cached.messageType,
    call: cached.call,
    replyTo: cached.replyTo,
  };
}

export async function getCachedChatMessages(
  chatId: string,
  userId: string,
): Promise<ChatMessage[]> {
  const database = getDb();
  if (!database) {
    return [];
  }

  const rows = await database.messages
    .where('[chatId+userId]')
    .equals([chatId, userId])
    .sortBy('createdAt');

  const messages = rows.map((row) => fromCachedMessage(row, userId));
  if (messages.length > 0) {
    setMemoryCachedChatMessages(chatId, userId, messages);
  }

  return messages;
}

function cacheKey(chatId: string, userId: string): [string, string] {
  return [chatId, userId];
}

export async function getCachedHasMoreOlder(
  chatId: string,
  userId: string,
): Promise<boolean> {
  const database = getDb();
  if (!database) {
    return false;
  }

  const meta = await database.chatMeta.get(cacheKey(chatId, userId));
  return meta?.hasMoreOlder ?? false;
}

export async function setCachedHasMoreOlder(
  chatId: string,
  userId: string,
  hasMoreOlder: boolean,
): Promise<void> {
  const database = getDb();
  if (!database) {
    return;
  }

  await database.chatMeta.put({
    chatId,
    userId,
    hasMoreOlder,
    updatedAt: new Date().toISOString(),
  });
}

export async function putCachedMessages(
  chatId: string,
  userId: string,
  messages: ChatMessage[],
): Promise<void> {
  const database = getDb();
  if (!database) {
    return;
  }

  const persistable = messages.filter(shouldPersistMessage).map((message) =>
    toCachedMessage(message, chatId, userId),
  );

  if (persistable.length === 0) {
    return;
  }

  await database.messages.bulkPut(persistable);
  setMemoryCachedChatMessages(chatId, userId, messages.filter(shouldPersistMessage));
}

export async function putCachedMessage(
  chatId: string,
  userId: string,
  message: ChatMessage,
): Promise<void> {
  if (!shouldPersistMessage(message)) {
    return;
  }

  const database = getDb();
  if (!database) {
    return;
  }

  await database.messages.put(toCachedMessage(message, chatId, userId));

  const existing = memoryCache.get(memoryCacheKey(chatId, userId)) ?? [];
  const index = existing.findIndex((entry) => entry.id === message.id);
  const next =
    index === -1
      ? insertMessageInOrder(existing, message)
      : existing.map((entry, entryIndex) => (entryIndex === index ? message : entry));
  setMemoryCachedChatMessages(chatId, userId, next);
}

export async function deleteCachedMessage(messageId: string): Promise<void> {
  const database = getDb();
  if (!database) {
    return;
  }

  await database.messages.delete(messageId);
}

export async function deleteCachedMessages(messageIds: string[]): Promise<void> {
  const database = getDb();
  if (!database || messageIds.length === 0) {
    return;
  }

  await database.messages.bulkDelete(messageIds);
}
