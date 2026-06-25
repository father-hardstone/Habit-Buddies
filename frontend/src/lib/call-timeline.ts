import { formatDaySeparator } from '@/lib/chat-time';
import { isSameDay } from 'date-fns';
import type { CallLogEntry } from './call-constants';
import type { ChatMessage } from './database';

export type ChatTimelineItem =
  | { type: 'day'; id: string; label: string }
  | { type: 'message'; id: string; message: ChatMessage }
  | { type: 'call'; id: string; call: CallLogEntry };

function parseTimelineInstant(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCallDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || totalSeconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function buildMessageTimeline(messages: ChatMessage[]): ChatTimelineItem[] {
  const sorted = [...messages].sort(
    (left, right) => parseTimelineInstant(left.createdAt) - parseTimelineInstant(right.createdAt),
  );

  const items: ChatTimelineItem[] = [];
  let lastDay: Date | null = null;

  for (const message of sorted) {
    const messageDate = new Date(message.createdAt);

    if (!lastDay || !isSameDay(lastDay, messageDate)) {
      items.push({
        type: 'day',
        id: `day-${message.createdAt.slice(0, 10)}`,
        label: formatDaySeparator(message.createdAt),
      });
      lastDay = messageDate;
    }

    if (message.messageType === 'call' && message.call) {
      items.push({
        type: 'call',
        id: `call-${message.id}`,
        call: message.call,
      });
      continue;
    }

    items.push({
      type: 'message',
      id: message.id,
      message,
    });
  }

  return items;
}

/** @deprecated Use buildMessageTimeline — call logs live in the messages array now. */
export function buildCombinedChatTimeline(
  messages: ChatMessage[],
  _calls: CallLogEntry[] = [],
): ChatTimelineItem[] {
  return buildMessageTimeline(messages);
}
