'use client';

import * as React from 'react';
import {
  addMessageToChat,
  type ChatMessage,
  type MessageReplyTo,
} from '@/lib/database';

const SEND_RETRY_DELAY_MS = 800;

type QueuedSend = {
  optimisticId: string;
  text: string;
  createdAt: string;
  replyToMessageId?: string;
  replyTo?: MessageReplyTo;
  attempt: number;
};

type UseMessageSendQueueOptions = {
  chatId: string;
  currentUserId: string;
  upsertMessage: (message: ChatMessage) => void;
  replaceMessage: (
    predicate: (message: ChatMessage) => boolean,
    next: ChatMessage,
  ) => void;
  updateMessages: (
    updater: (messages: ChatMessage[]) => ChatMessage[],
  ) => void;
  onSent?: (payload: {
    text: string;
    saved: ChatMessage;
  }) => void;
  onScrollToLatest?: () => void;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function insertInQueueOrder(queue: QueuedSend[], item: QueuedSend) {
  const insertAt = queue.findIndex(
    (entry) => entry.createdAt.localeCompare(item.createdAt) > 0,
  );

  if (insertAt === -1) {
    queue.push(item);
    return;
  }

  queue.splice(insertAt, 0, item);
}

export function useMessageSendQueue({
  chatId,
  currentUserId,
  upsertMessage,
  replaceMessage,
  updateMessages,
  onSent,
  onScrollToLatest,
}: UseMessageSendQueueOptions) {
  const queueRef = React.useRef<QueuedSend[]>([]);
  const processingRef = React.useRef(false);
  const sequenceRef = React.useRef(0);
  const chatIdRef = React.useRef(chatId);

  chatIdRef.current = chatId;

  React.useEffect(() => {
    queueRef.current = [];
    processingRef.current = false;
    sequenceRef.current = 0;
  }, [chatId]);

  const markFailed = React.useCallback(
    (optimisticId: string) => {
      updateMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticId
            ? {
                ...message,
                pending: false,
                sendFailed: true,
                status: undefined,
              }
            : message,
        ),
      );
    },
    [updateMessages],
  );

  const processQueue = React.useCallback(async () => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    const activeChatId = chatIdRef.current;

    try {
      while (queueRef.current.length > 0) {
        const item = queueRef.current[0];

        if (chatIdRef.current !== activeChatId) {
          break;
        }

        try {
          const saved = await addMessageToChat(activeChatId, item.text, {
            replyToMessageId: item.replyToMessageId,
          });

          if (chatIdRef.current !== activeChatId) {
            break;
          }

          replaceMessage(
            (entry) => entry.id === item.optimisticId,
            { ...saved, status: saved.status ?? 'sent' },
          );

          onSent?.({ text: item.text, saved: { ...saved, status: saved.status ?? 'sent' } });
          onScrollToLatest?.();
          queueRef.current.shift();
        } catch {
          if (item.attempt < 1) {
            item.attempt += 1;
            await sleep(SEND_RETRY_DELAY_MS);
            continue;
          }

          markFailed(item.optimisticId);
          queueRef.current.shift();
        }
      }
    } finally {
      processingRef.current = false;

      if (queueRef.current.length > 0 && chatIdRef.current === activeChatId) {
        void processQueue();
      }
    }
  }, [markFailed, onScrollToLatest, onSent, replaceMessage]);

  const enqueueMessage = React.useCallback(
    (payload: {
      text: string;
      replyTo?: MessageReplyTo;
    }) => {
      const createdAt = new Date().toISOString();
      sequenceRef.current += 1;
      const optimisticId = `pending-${Date.now()}-${sequenceRef.current}`;

      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        sender: 'me',
        senderId: currentUserId,
        text: payload.text,
        createdAt,
        pending: true,
        status: 'pending',
        ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      };

      upsertMessage(optimisticMessage);
      onScrollToLatest?.();

      insertInQueueOrder(queueRef.current, {
        optimisticId,
        text: payload.text,
        createdAt,
        replyToMessageId: payload.replyTo?.id,
        replyTo: payload.replyTo,
        attempt: 0,
      });

      void processQueue();
    },
    [currentUserId, onScrollToLatest, processQueue, upsertMessage],
  );

  const retryFailedMessage = React.useCallback(
    (message: ChatMessage) => {
      if (!message.sendFailed) {
        return;
      }

      updateMessages((prev) =>
        prev.map((entry) =>
          entry.id === message.id
            ? {
                ...entry,
                pending: true,
                sendFailed: false,
                status: 'pending',
              }
            : entry,
        ),
      );

      insertInQueueOrder(queueRef.current, {
        optimisticId: message.id,
        text: message.text,
        createdAt: message.createdAt,
        replyToMessageId: message.replyTo?.id,
        replyTo: message.replyTo,
        attempt: 0,
      });

      void processQueue();
    },
    [processQueue, updateMessages],
  );

  return {
    enqueueMessage,
    retryFailedMessage,
  };
}
