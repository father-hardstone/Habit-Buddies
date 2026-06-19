import { format, isToday, isYesterday, isSameDay } from 'date-fns';

export function formatMessageTime(iso: string): string {
  return format(new Date(iso), 'h:mm a');
}

export function formatChatListTime(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MM/dd/yy');
}

export function formatDaySeparator(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function buildChatTimeline<T extends { id: string; createdAt: string }>(
  messages: T[],
): Array<
  | { type: 'day'; id: string; label: string }
  | { type: 'message'; id: string; message: T }
> {
  const items: Array<
    | { type: 'day'; id: string; label: string }
    | { type: 'message'; id: string; message: T }
  > = [];

  let lastDay: Date | null = null;

  for (const message of messages) {
    const messageDate = new Date(message.createdAt);
    if (!lastDay || !isSameDay(lastDay, messageDate)) {
      items.push({
        type: 'day',
        id: `day-${message.createdAt.slice(0, 10)}`,
        label: formatDaySeparator(message.createdAt),
      });
      lastDay = messageDate;
    }

    items.push({ type: 'message', id: message.id, message });
  }

  return items;
}
