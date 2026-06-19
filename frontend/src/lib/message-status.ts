import type { ChatMessage, MessageStatus } from '@/lib/database';

export function applyPeerReadToMessages(
  messages: ChatMessage[],
  peerReadAt: string,
): ChatMessage[] {
  const readTime = new Date(peerReadAt).getTime();

  return messages.map((message) => {
    if (message.sender !== 'me' || message.pending) {
      return message;
    }

    if (new Date(message.createdAt).getTime() <= readTime) {
      return { ...message, status: 'read' satisfies MessageStatus };
    }

    return message;
  });
}

export function markMessageDelivered(
  messages: ChatMessage[],
  messageId: string,
): ChatMessage[] {
  return messages.map((message) => {
    if (message.id !== messageId || message.sender !== 'me') {
      return message;
    }

    if (message.status === 'read') {
      return message;
    }

    return { ...message, status: 'delivered' satisfies MessageStatus };
  });
}

export function enrichOutgoingMessages(
  messages: ChatMessage[],
  peerLastReadAt: string | null | undefined,
): ChatMessage[] {
  const peerReadTime = peerLastReadAt
    ? new Date(peerLastReadAt).getTime()
    : null;

  return messages.map((message) => {
    if (message.sender !== 'me' || message.pending) {
      return message;
    }

    if (message.status === 'sent') {
      return message;
    }

    if (
      peerReadTime != null &&
      new Date(message.createdAt).getTime() <= peerReadTime
    ) {
      return { ...message, status: 'read' satisfies MessageStatus };
    }

    return {
      ...message,
      status: (message.status ?? 'delivered') satisfies MessageStatus,
    };
  });
}
