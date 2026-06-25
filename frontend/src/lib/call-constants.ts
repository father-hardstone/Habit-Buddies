export const CALL_DURATION_CHECK_MS = 5 * 60 * 1000;
export const CALL_STILL_THERE_TIMEOUT_MS = 2 * 60 * 1000;
export const CALL_END_RETURN_MS = 3 * 1000;
export const CALL_RING_TIMEOUT_MS = 90 * 1000;

export type CallMode = 'audio' | 'video';

export type CallStatus =
  | 'ringing'
  | 'ongoing'
  | 'ended'
  | 'missed'
  | 'declined';

export type CallLogEntry = {
  id: string;
  chatId: string;
  mode: CallMode;
  status: CallStatus;
  initiatorId: string;
  isOutgoing: boolean;
  createdAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
};

export type ChatCallMessage = CallLogEntry;

export type CallInvitePayload = {
  callId: string;
  chatId: string;
  mode: CallMode;
  initiatorId: string;
  initiatorName: string;
  initiatorAvatar?: string;
  peerName: string;
  peerAvatar?: string;
  peerUserId?: string;
  roomUrl?: string;
  token?: string;
  createdAt: string;
};

export type CallEventPayload = {
  callId: string;
  chatId: string;
  status?: CallStatus;
  mode?: CallMode;
  initiatorId?: string;
  endedBy?: string | null;
  durationSeconds?: number | null;
  endedAt?: string;
  acceptedBy?: string;
  declinedBy?: string;
};

export type CallPhase =
  | 'idle'
  | 'confirm'
  | 'starting'
  | 'outgoing'
  | 'incoming'
  | 'joining'
  | 'active'
  | 'still_there'
  | 'ended_message';

export type ActiveCallState = {
  callId: string;
  chatId: string;
  mode: CallMode;
  peerName: string;
  peerAvatar: string;
  peerUserId?: string;
  roomUrl: string;
  token: string;
  role: 'caller' | 'callee';
};

export type CallConfirmTarget = {
  chatId: string;
  peerName: string;
  peerAvatar: string;
  mode: CallMode;
};
