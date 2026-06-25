import { broadcastOnChat } from '@/lib/chat-broadcast-bridge';
import type { CallEventPayload, CallInvitePayload } from '@/lib/call-constants';
import { sendUserInboxBroadcast } from '@/lib/user-inbox-channel';

export type CallSignalEvent =
  | 'call_invite'
  | 'call_accept'
  | 'call_decline'
  | 'call_cancel'
  | 'call_end'
  | 'call_missed';

type CallSignalPayload = CallInvitePayload | CallEventPayload;

export function broadcastCallSignal(
  chatId: string,
  recipientUserIds: string[],
  event: CallSignalEvent,
  payload: CallSignalPayload,
  currentUserId?: string,
): void {
  broadcastOnChat(chatId, event, payload);

  for (const userId of recipientUserIds) {
    if (userId && userId !== currentUserId) {
      sendUserInboxBroadcast(userId, event, payload);
    }
  }
}
