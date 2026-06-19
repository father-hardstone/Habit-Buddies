'use client';

import * as React from 'react';
import { getChatMessages, type ChatMessage } from '@/lib/database';
import { enrichOutgoingMessages } from '@/lib/message-status';
import { handleAsyncError } from '@/lib/error-utils';

export const CHAT_PRIORITY_COUNT = 6;
export const CHAT_INITIAL_PAGE_SIZE = 30;
export const CHAT_LOAD_MORE_SIZE = 10;

type UseChatMessagesOptions = {
  chatId: string;
  peerLastReadAt?: string | null;
  enabled?: boolean;
};

export function useChatMessages({
  chatId,
  peerLastReadAt,
  enabled = true,
}: UseChatMessagesOptions) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = React.useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [visibleIds, setVisibleIds] = React.useState<Set<string>>(new Set());
  const revealTimersRef = React.useRef<number[]>([]);
  const prependAnchorRef = React.useRef<{ scrollHeight: number; scrollTop: number } | null>(
    null,
  );

  const clearRevealTimers = React.useCallback(() => {
    for (const timer of revealTimersRef.current) {
      window.clearTimeout(timer);
    }
    revealTimersRef.current = [];
  }, []);

  const scheduleReveal = React.useCallback(
    (batch: ChatMessage[], immediate = false) => {
      clearRevealTimers();

      if (batch.length === 0) {
        return;
      }

      const priority = batch.slice(-CHAT_PRIORITY_COUNT);
      setVisibleIds((prev) => {
        const next = new Set(prev);
        for (const message of priority) {
          next.add(message.id);
        }
        return next;
      });

      const deferred = batch.slice(0, Math.max(0, batch.length - CHAT_PRIORITY_COUNT));
      deferred.forEach((message, index) => {
        const delay = immediate ? 0 : 70 * (index + 1);
        const timer = window.setTimeout(() => {
          setVisibleIds((prev) => new Set(prev).add(message.id));
        }, delay);
        revealTimersRef.current.push(timer);
      });
    },
    [clearRevealTimers],
  );

  React.useEffect(() => {
    if (!enabled || !chatId) {
      return;
    }

    let cancelled = false;
    setIsLoadingInitial(true);
    setMessages([]);
    setVisibleIds(new Set());
    setHasMoreOlder(false);
    clearRevealTimers();

    getChatMessages(chatId, { limit: CHAT_INITIAL_PAGE_SIZE })
      .then((page) => {
        if (cancelled) {
          return;
        }

        const enriched = enrichOutgoingMessages(page.messages, peerLastReadAt);
        setMessages(enriched);
        setHasMoreOlder(page.hasMore);
        scheduleReveal(enriched);
      })
      .catch((error) => {
        if (!cancelled) {
          handleAsyncError(error, {
            title: 'Could not load messages',
            context: 'chat.messages.initial',
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingInitial(false);
        }
      });

    return () => {
      cancelled = true;
      clearRevealTimers();
    };
    // Only refetch when switching chats — not when read receipts update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, enabled, scheduleReveal, clearRevealTimers]);

  const loadOlderMessages = React.useCallback(async () => {
    if (isLoadingMore || !hasMoreOlder || messages.length === 0) {
      return;
    }

    setIsLoadingMore(true);
    const oldest = messages[0];

    try {
      const page = await getChatMessages(chatId, {
        limit: CHAT_LOAD_MORE_SIZE,
        before: oldest.createdAt,
      });

      const enriched = enrichOutgoingMessages(page.messages, peerLastReadAt);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((message) => message.id));
        const uniqueOlder = enriched.filter((message) => !existingIds.has(message.id));
        return [...uniqueOlder, ...prev];
      });

      setHasMoreOlder(page.hasMore);

      setVisibleIds((prev) => {
        const next = new Set(prev);
        for (const message of enriched) {
          next.add(message.id);
        }
        return next;
      });
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not load earlier messages',
        context: 'chat.messages.loadMore',
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, hasMoreOlder, isLoadingMore, messages, peerLastReadAt]);

  const capturePrependScrollAnchor = React.useCallback(
    (scrollElement: HTMLDivElement | null) => {
      if (!scrollElement) {
        return;
      }

      prependAnchorRef.current = {
        scrollHeight: scrollElement.scrollHeight,
        scrollTop: scrollElement.scrollTop,
      };
    },
    [],
  );

  const restorePrependScrollAnchor = React.useCallback(
    (scrollElement: HTMLDivElement | null) => {
      const anchor = prependAnchorRef.current;
      if (!scrollElement || !anchor) {
        return;
      }

      const heightDelta = scrollElement.scrollHeight - anchor.scrollHeight;
      scrollElement.scrollTop = anchor.scrollTop + heightDelta;
      prependAnchorRef.current = null;
    },
    [],
  );

  const upsertMessage = React.useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((entry) => entry.id === message.id)) {
        return prev;
      }

      return [...prev, message];
    });
    setVisibleIds((prev) => new Set(prev).add(message.id));
  }, []);

  const replaceMessage = React.useCallback(
    (predicate: (message: ChatMessage) => boolean, next: ChatMessage) => {
      setMessages((prev) => {
        const index = prev.findIndex(predicate);
        if (index === -1) {
          return prev;
        }

        const copy = [...prev];
        const previousId = copy[index].id;
        copy[index] = next;

        setVisibleIds((visible) => {
          const updated = new Set(visible);
          updated.delete(previousId);
          updated.add(next.id);
          return updated;
        });

        return copy;
      });
    },
    [],
  );

  const removeMessage = React.useCallback((predicate: (message: ChatMessage) => boolean) => {
    setMessages((prev) => {
      const removed = prev.filter(predicate);
      const next = prev.filter((message) => !predicate(message));

      if (removed.length > 0) {
        setVisibleIds((visible) => {
          const updated = new Set(visible);
          for (const message of removed) {
            updated.delete(message.id);
          }
          return updated;
        });
      }

      return next;
    });
  }, []);

  const updateMessages = React.useCallback(
    (updater: (messages: ChatMessage[]) => ChatMessage[]) => {
      setMessages((prev) => {
        const next = updater(prev);

        setVisibleIds((visible) => {
          const updated = new Set(visible);
          const nextIds = new Set(next.map((message) => message.id));

          for (const message of next) {
            updated.add(message.id);
          }

          for (const message of prev) {
            if (!nextIds.has(message.id)) {
              updated.delete(message.id);
            }
          }

          return updated;
        });

        return next;
      });
    },
    [],
  );

  return {
    messages,
    hasMoreOlder,
    isLoadingInitial,
    isLoadingMore,
    visibleIds,
    loadOlderMessages,
    upsertMessage,
    replaceMessage,
    removeMessage,
    updateMessages,
    capturePrependScrollAnchor,
    restorePrependScrollAnchor,
  };
}
