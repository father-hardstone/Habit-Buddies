import { apiFetch } from './api-client';
import type { CallLogEntry, CallMode } from './call-constants';

export type CreateCallResponse = {
  call: CallLogEntry;
  roomUrl: string;
  token: string;
  calleeToken: string;
  peerUserId: string;
};

export type JoinCallResponse = {
  call: CallLogEntry;
  roomUrl: string;
  token: string;
};

export function getChatCallHistory(chatId: string) {
  return apiFetch<CallLogEntry[]>(`/data/chats/${chatId}/calls`);
}

export function createChatCall(chatId: string, mode: CallMode) {
  return apiFetch<CreateCallResponse>(`/data/chats/${chatId}/calls`, {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export function acceptChatCall(chatId: string, callId: string) {
  return apiFetch<JoinCallResponse>(
    `/data/chats/${chatId}/calls/${callId}/accept`,
    { method: 'POST' },
  );
}

export function declineChatCall(chatId: string, callId: string) {
  return apiFetch<CallLogEntry>(
    `/data/chats/${chatId}/calls/${callId}/decline`,
    { method: 'POST' },
  );
}

export function endChatCall(chatId: string, callId: string) {
  return apiFetch<CallLogEntry>(
    `/data/chats/${chatId}/calls/${callId}/end`,
    { method: 'POST' },
  );
}

export function markChatCallMissed(chatId: string, callId: string) {
  return apiFetch<CallLogEntry | null>(
    `/data/chats/${chatId}/calls/${callId}/missed`,
    { method: 'POST' },
  );
}
