import { formatDaySeparator } from '@/lib/chat-time';
import { isSameDay } from 'date-fns';
import type {
  CallEventPayload,
  CallInvitePayload,
  CallLogEntry,
  CallStatus,
} from './call-constants';
import type { ChatMessage } from './database';

export type TimelineChatMessage = ChatMessage & { kind: 'message' };
export type TimelineCallEntry = CallLogEntry & { kind: 'call' };

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

/** Calls are anchored when they start, not when they end. */
export function getCallTimelineInstant(call: CallLogEntry): number {
  return parseTimelineInstant(call.createdAt);
}

function getMessageTimelineInstant(message: ChatMessage): number {
  return parseTimelineInstant(message.createdAt);
}

function compareTimelineEntries(
  left: { instant: number; type: 'message' | 'call'; id: string },
  right: { instant: number; type: 'message' | 'call'; id: string },
): number {
  if (left.instant !== right.instant) {
    return left.instant - right.instant;
  }

  if (left.type !== right.type) {
    return left.type === 'message' ? -1 : 1;
  }

  return left.id.localeCompare(right.id);
}

export function upsertCallLogEntry(
  entries: CallLogEntry[],
  next: CallLogEntry,
): CallLogEntry[] {
  const index = entries.findIndex((entry) => entry.id === next.id);

  if (index === -1) {
    return [...entries, next].sort(
      (left, right) => getCallTimelineInstant(left) - getCallTimelineInstant(right),
    );
  }

  const merged = [...entries];
  merged[index] = { ...merged[index], ...next };
  return merged;
}

export function applyCallRealtimeEvent(
  entries: CallLogEntry[],
  event:
    | 'call_invite'
    | 'call_accept'
    | 'call_decline'
    | 'call_end'
    | 'call_missed',
  payload: CallInvitePayload | CallEventPayload,
  chatId: string,
  currentUserId: string,
): CallLogEntry[] {
  if (!payload?.callId || ('chatId' in payload && payload.chatId !== chatId)) {
    return entries;
  }

  if (event === 'call_invite') {
    const invite = payload as CallInvitePayload;
    return upsertCallLogEntry(entries, {
      id: invite.callId,
      chatId: invite.chatId,
      mode: invite.mode,
      status: 'ringing',
      initiatorId: invite.initiatorId,
      isOutgoing: invite.initiatorId === currentUserId,
      createdAt: invite.createdAt,
      endedAt: null,
      durationSeconds: null,
    });
  }

  const update = payload as CallEventPayload;
  const existing = entries.find((entry) => entry.id === update.callId);
  const status: CallStatus =
    update.status ??
    (event === 'call_accept'
      ? 'ongoing'
      : event === 'call_decline'
        ? 'declined'
        : event === 'call_missed'
          ? 'missed'
          : 'ended');

  return upsertCallLogEntry(entries, {
    id: update.callId,
    chatId,
    mode: update.mode ?? existing?.mode ?? 'audio',
    status,
    initiatorId: update.initiatorId ?? existing?.initiatorId ?? '',
    isOutgoing:
      (update.initiatorId ?? existing?.initiatorId ?? '') === currentUserId,
    createdAt: existing?.createdAt ?? update.endedAt ?? new Date().toISOString(),
    endedAt: update.endedAt ?? existing?.endedAt ?? null,
    durationSeconds: update.durationSeconds ?? existing?.durationSeconds ?? null,
  });
}

export function buildCombinedChatTimeline(
  messages: ChatMessage[],
  calls: CallLogEntry[],
): ChatTimelineItem[] {
  const combined: Array<
    | { sortAt: string; instant: number; type: 'message'; id: string; message: ChatMessage }
    | { sortAt: string; instant: number; type: 'call'; id: string; call: CallLogEntry }
  > = [
    ...messages.map((message) => ({
      sortAt: message.createdAt,
      instant: getMessageTimelineInstant(message),
      type: 'message' as const,
      id: message.id,
      message,
    })),
    ...calls.map((call) => ({
      sortAt: call.createdAt,
      instant: getCallTimelineInstant(call),
      type: 'call' as const,
      id: call.id,
      call,
    })),
  ].sort((left, right) => compareTimelineEntries(left, right));

  const items: ChatTimelineItem[] = [];
  let lastDay: Date | null = null;

  for (const entry of combined) {
    const sortAt = entry.sortAt;
    const messageDate = new Date(entry.instant || sortAt);

    if (!lastDay || !isSameDay(lastDay, messageDate)) {
      items.push({
        type: 'day',
        id: `day-${sortAt.slice(0, 10)}`,
        label: formatDaySeparator(sortAt),
      });
      lastDay = messageDate;
    }

    if (entry.type === 'message') {
      items.push({
        type: 'message',
        id: entry.message.id,
        message: entry.message,
      });
    } else {
      items.push({
        type: 'call',
        id: `call-${entry.call.id}`,
        call: entry.call,
      });
    }
  }

  return items;
}

export function formatCallDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || totalSeconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
