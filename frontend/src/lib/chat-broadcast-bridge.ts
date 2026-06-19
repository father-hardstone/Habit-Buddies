type ChatBroadcastSend = (event: string, payload: unknown) => void;

const senders = new Map<string, ChatBroadcastSend>();

export function registerChatBroadcastSender(
  chatId: string,
  send: ChatBroadcastSend,
): () => void {
  senders.set(chatId, send);
  return () => {
    if (senders.get(chatId) === send) {
      senders.delete(chatId);
    }
  };
}

export function broadcastOnChat(chatId: string, event: string, payload: unknown): boolean {
  const send = senders.get(chatId);
  if (!send) {
    return false;
  }

  send(event, payload);
  return true;
}
