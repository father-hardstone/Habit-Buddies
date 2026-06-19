import { broadcastOnChat } from '@/lib/chat-broadcast-bridge';
import type { CallEventPayload } from '@/lib/call-constants';

export function broadcastCallEnd(
  chatId: string,
  callId: string,
  status: CallEventPayload['status'] = 'ended',
): void {
  const payload: CallEventPayload = {
    callId,
    chatId,
    status,
  };

  broadcastOnChat(chatId, 'call_end', payload);
}
