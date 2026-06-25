import { broadcastCallSignal } from '@/lib/call-signaling';
import type { CallEventPayload } from '@/lib/call-constants';

export function broadcastCallEnd(
  chatId: string,
  callId: string,
  status: CallEventPayload['status'] = 'ended',
  recipientUserIds: string[] = [],
  currentUserId?: string,
): void {
  const payload: CallEventPayload = {
    callId,
    chatId,
    status,
  };

  broadcastCallSignal(
    chatId,
    recipientUserIds,
    status === 'missed' || status === 'declined' ? 'call_missed' : 'call_end',
    payload,
    currentUserId,
  );
}
