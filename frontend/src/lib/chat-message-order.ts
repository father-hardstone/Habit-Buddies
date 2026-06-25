import type { ChatMessage } from '@/lib/database';

function messageInstant(message: ChatMessage): number {
  const parsed = Date.parse(message.createdAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function compareMessagesByTime(left: ChatMessage, right: ChatMessage): number {
  const delta = messageInstant(left) - messageInstant(right);
  if (delta !== 0) {
    return delta;
  }

  return left.id.localeCompare(right.id);
}

export function insertMessageInOrder(
  messages: ChatMessage[],
  message: ChatMessage,
): ChatMessage[] {
  if (messages.some((entry) => entry.id === message.id)) {
    return messages;
  }

  const next = [...messages, message].sort(compareMessagesByTime);
  return next;
}

export function mergeMessagesInOrder(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  if (incoming.length === 0) {
    return existing;
  }

  const byId = new Map(existing.map((message) => [message.id, message]));

  for (const message of incoming) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort(compareMessagesByTime);
}
