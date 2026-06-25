export type InboxCallEvent =
  | 'call_invite'
  | 'call_accept'
  | 'call_decline'
  | 'call_cancel'
  | 'call_end'
  | 'call_missed';

type InboxCallListener = (event: InboxCallEvent, payload: unknown) => void;

const listeners = new Set<InboxCallListener>();

export function registerInboxCallListener(listener: InboxCallListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitInboxCallEvent(event: InboxCallEvent, payload: unknown): void {
  for (const listener of listeners) {
    listener(event, payload);
  }
}

export const INBOX_CALL_EVENTS: InboxCallEvent[] = [
  'call_invite',
  'call_accept',
  'call_decline',
  'call_cancel',
  'call_end',
  'call_missed',
];
