'use client';

import * as React from 'react';
import { getChatMessages, type ChatMessage } from '@/lib/database';
import { mergeMessagesInOrder } from '@/lib/chat-message-order';
import {
  deleteCachedMessage,
  deleteCachedMessages,
  getCachedChatMessages,
  getCachedHasMoreOlder,
  getMemoryCachedChatMessages,
  putCachedMessage,
  putCachedMessages,
  setCachedHasMoreOlder,
  setMemoryCachedChatMessages,
} from '@/lib/chat-message-cache';
import { enrichOutgoingMessages } from '@/lib/message-status';
import { handleAsyncError } from '@/lib/error-utils';

export const CHAT_PRIORITY_COUNT = 6;
export const CHAT_INITIAL_PAGE_SIZE = 30;
export const CHAT_LOAD_MORE_SIZE = 10;

type UseChatMessagesOptions = {
  chatId: string;
  currentUserId: string;
  peerLastReadAt?: string | null;
  enabled?: boolean;
};

function persistMessages(chatId: string, userId: string, messages: ChatMessage[]) {
  setMemoryCachedChatMessages(chatId, userId, messages);
  void putCachedMessages(chatId, userId, messages).catch(() => undefined);
}

function readMemorySnapshot(
  chatId: string,
  currentUserId: string,
  peerLastReadAt?: string | null,
): ChatMessage[] {
  const memory = getMemoryCachedChatMessages(chatId, currentUserId);
  if (!memory?.length) {
    return [];
  }

  return enrichOutgoingMessages(memory, peerLastReadAt);
}

export function useChatMessages({
  chatId,
  currentUserId,
  peerLastReadAt,
  enabled = true,
}: UseChatMessagesOptions) {
  const initialSnapshot = readMemorySnapshot(chatId, currentUserId, peerLastReadAt);

  const [messages, setMessages] = React.useState<ChatMessage[]>(initialSnapshot);
  const [hasMoreOlder, setHasMoreOlder] = React.useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = React.useState(initialSnapshot.length === 0);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [visibleIds, setVisibleIds] = React.useState<Set<string>>(
    () => new Set(initialSnapshot.map((message) => message.id)),
  );
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

      if (immediate) {
        setVisibleIds(new Set(batch.map((message) => message.id)));
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
        const timer = window.setTimeout(() => {
          setVisibleIds((prev) => new Set(prev).add(message.id));
        }, 70 * (index + 1));
        revealTimersRef.current.push(timer);
      });
    },
    [clearRevealTimers],
  );

  React.useLayoutEffect(() => {
    if (!enabled || !chatId || !currentUserId) {
      return;
    }

    let cancelled = false;
    clearRevealTimers();

    const memorySnapshot = readMemorySnapshot(chatId, currentUserId, peerLastReadAt);
    const hadMemory = memorySnapshot.length > 0;

    if (hadMemory) {
      setMessages(memorySnapshot);
      scheduleReveal(memorySnapshot, true);
      setIsLoadingInitial(false);
    } else {
      setMessages([]);
      setVisibleIds(new Set());
      setHasMoreOlder(false);
      setIsLoadingInitial(true);
    }

    const loadChat = async () => {
      try {
        const [cached, cachedHasMore] = await Promise.all([
          hadMemory ? Promise.resolve(memorySnapshot) : getCachedChatMessages(chatId, currentUserId),
          getCachedHasMoreOlder(chatId, currentUserId),
        ]);

        if (cancelled) {
          return;
        }

        const cachedEnriched = hadMemory
          ? memorySnapshot
          : enrichOutgoingMessages(cached, peerLastReadAt);
        const hadCache = cachedEnriched.length > 0;

        if (hadCache && !hadMemory) {
          setMessages(cachedEnriched);
          setHasMoreOlder(cachedHasMore);
          scheduleReveal(cachedEnriched, true);
          setIsLoadingInitial(false);
        } else if (hadCache) {
          setHasMoreOlder(cachedHasMore);
        }

        const latestCached = cachedEnriched.at(-1);
        let serverMessages: ChatMessage[] = [];
        let nextHasMoreOlder = hadCache ? cachedHasMore : false;

        if (!hadCache) {
          const page = await getChatMessages(chatId, { limit: CHAT_INITIAL_PAGE_SIZE });
          if (cancelled) {
            return;
          }

          serverMessages = page.messages;
          nextHasMoreOlder = page.hasMore;
        } else {
          const [newerPage, recentPage] = await Promise.all([
            latestCached
              ? getChatMessages(chatId, { after: latestCached.createdAt, limit: 50 })
              : Promise.resolve({ messages: [], hasMore: false }),
            getChatMessages(chatId, { limit: CHAT_INITIAL_PAGE_SIZE }),
          ]);

          if (cancelled) {
            return;
          }

          serverMessages = mergeMessagesInOrder(newerPage.messages, recentPage.messages);

          const recentOldest = recentPage.messages[0]?.createdAt;
          const cacheHasOlderBeyondRecent =
            cachedEnriched.length > 0 &&
            recentOldest != null &&
            cachedEnriched[0].createdAt < recentOldest;

          nextHasMoreOlder = cacheHasOlderBeyondRecent || recentPage.hasMore;
        }

        const serverEnriched = enrichOutgoingMessages(serverMessages, peerLastReadAt);
        const merged = mergeMessagesInOrder(
          hadCache ? cachedEnriched : [],
          serverEnriched,
        );

        setMessages(merged);
        setHasMoreOlder(nextHasMoreOlder);
        scheduleReveal(merged, hadCache || hadMemory);
        persistMessages(chatId, currentUserId, merged);
        void setCachedHasMoreOlder(chatId, currentUserId, nextHasMoreOlder);
      } catch (error) {
        if (!cancelled) {
          handleAsyncError(error, {
            title: 'Could not load messages',
            context: 'chat.messages.initial',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInitial(false);
        }
      }
    };

    void loadChat();

    return () => {
      cancelled = true;
      clearRevealTimers();
    };
    // Only refetch when switching chats — not when read receipts update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, currentUserId, enabled, scheduleReveal, clearRevealTimers]);

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
        const next = [...uniqueOlder, ...prev];
        persistMessages(chatId, currentUserId, next);
        return next;
      });

      setHasMoreOlder(page.hasMore);
      void setCachedHasMoreOlder(chatId, currentUserId, page.hasMore);

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
  }, [
    chatId,
    currentUserId,
    hasMoreOlder,
    isLoadingMore,
    messages,
    peerLastReadAt,
  ]);

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

  const upsertMessage = React.useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        const next = mergeMessagesInOrder(prev, [message]);
        void putCachedMessage(chatId, currentUserId, message).catch(() => undefined);
        setMemoryCachedChatMessages(chatId, currentUserId, next);
        return next;
      });
      setVisibleIds((prev) => new Set(prev).add(message.id));
    },
    [chatId, currentUserId],
  );

  const mergeMessages = React.useCallback(
    (incoming: ChatMessage[]) => {
      if (incoming.length === 0) {
        return;
      }

      setMessages((prev) => {
        const next = mergeMessagesInOrder(prev, incoming);
        persistMessages(chatId, currentUserId, next);
        return next;
      });

      setVisibleIds((prev) => {
        const next = new Set(prev);
        for (const message of incoming) {
          next.add(message.id);
        }
        return next;
      });
    },
    [chatId, currentUserId],
  );

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

        if (previousId !== next.id) {
          void deleteCachedMessage(previousId).catch(() => undefined);
        }

        void putCachedMessage(chatId, currentUserId, next).catch(() => undefined);
        setMemoryCachedChatMessages(chatId, currentUserId, copy);

        return copy;
      });
    },
    [chatId, currentUserId],
  );

  const removeMessage = React.useCallback(
    (predicate: (message: ChatMessage) => boolean) => {
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

          void deleteCachedMessages(removed.map((message) => message.id)).catch(
            () => undefined,
          );
          setMemoryCachedChatMessages(chatId, currentUserId, next);
        }

        return next;
      });
    },
    [chatId, currentUserId],
  );

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

        persistMessages(chatId, currentUserId, next);
        return next;
      });
    },
    [chatId, currentUserId],
  );

  return {
    messages,
    hasMoreOlder,
    isLoadingInitial,
    isLoadingMore,
    visibleIds,
    loadOlderMessages,
    upsertMessage,
    mergeMessages,
    replaceMessage,
    removeMessage,
    updateMessages,
    capturePrependScrollAnchor,
    restorePrependScrollAnchor,
  };
}
