
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  ArrowDown,
  Check,
  ChevronUp,
  Loader2,
  MoreVertical,
  Phone,
  Send,
  Smile,
  Video,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, DetailedChat, MessageStatus } from '@/lib/database';
import { addMessageToChat, deleteMessageFromChat, markChatRead } from '@/lib/database';
import { buildCombinedChatTimeline, applyCallRealtimeEvent } from '@/lib/call-timeline';
import type { CallLogEntry } from '@/lib/call-constants';
import { getChatCallHistory } from '@/lib/calls-api';
import { formatMessageTime } from '@/lib/chat-time';
import { useChatRealtime } from '@/hooks/use-chat-realtime';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { isChatRealtimeEnabled } from '@/lib/supabase-client';
import { handleAsyncError } from '@/lib/error-utils';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import {
  applyPeerReadToMessages,
  markMessageDelivered,
} from '@/lib/message-status';
import { MessageStatusIcon } from '@/components/chats/message-status-icon';
import { AvatarViewModal } from '@/components/avatar-view-modal';
import { MessageActionsMenu } from '@/components/chats/message-actions-menu';
import { ForwardMessageDialog } from '@/components/chats/forward-message-dialog';
import { useChatsContext } from '@/components/chats/chats-context';
import { useCallContext } from '@/context/call-provider';
import { CallTimelineItem } from '@/components/calls/call-timeline-item';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatViewProps {
  chat: NonNullable<DetailedChat>;
  currentUserId: string;
  embedded?: boolean;
  onChatActivity?: (update: {
    latestMessage: string;
    timestamp: string;
    senderId: string;
    status?: MessageStatus;
  }) => void;
  onListStatusChange?: (status: MessageStatus) => void;
}

const PEER_NAME_COLORS = [
  '#e542a3',
  '#ff6b6b',
  '#e67e22',
  '#25d366',
  '#3498db',
  '#9b59b6',
  '#1abc9c',
  '#e91e63',
];

function peerNameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PEER_NAME_COLORS[Math.abs(hash) % PEER_NAME_COLORS.length];
}

function replySenderLabel(
  replyTo: NonNullable<ChatMessage['replyTo']>,
  peerName: string,
): string {
  return replyTo.sender === 'me' ? 'You' : peerName;
}

function MessageBubble({
  message,
  peerAvatar,
  peerName,
  showTail,
  showName,
  showAvatar,
  isVisible,
  onAvatarClick,
  onCopy,
  onReply,
  onForward,
  onDelete,
}: {
  message: ChatMessage;
  peerAvatar: string;
  peerName: string;
  showTail: boolean;
  showName: boolean;
  showAvatar: boolean;
  isVisible: boolean;
  onAvatarClick?: () => void;
  onCopy: () => void;
  onReply: () => void;
  onForward: () => void;
  onDelete?: () => void;
}) {
  const isMe = message.sender === 'me';
  const nameColor = peerNameColor(peerName);
  const canDelete = isMe && !message.pending && Boolean(onDelete);

  return (
    <div
      className={cn(
        'group/message flex items-end gap-1 transition-opacity duration-300 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        isMe ? 'justify-end' : 'justify-start',
      )}
    >
      {!isMe && (
        <div className="size-8 shrink-0">
          {showAvatar ? (
            <button
              type="button"
              onClick={onAvatarClick}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`View ${peerName}'s profile photo`}
            >
              <Avatar className="size-8">
                <AvatarImage src={peerAvatar} alt={peerName} />
                <AvatarFallback>{peerName.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
          ) : null}
        </div>
      )}
      {!isMe ? (
        <MessageActionsMenu
          isMe={false}
          canDelete={false}
          onCopy={onCopy}
          onReply={onReply}
          onForward={onForward}
        />
      ) : null}
      {isMe ? (
        <MessageActionsMenu
          isMe
          canDelete={canDelete}
          onCopy={onCopy}
          onReply={onReply}
          onForward={onForward}
          onDelete={onDelete}
        />
      ) : null}
      <div
        className={cn(
          'relative max-w-[min(78%,20rem)] px-3 py-1.5 shadow-sm',
          isMe
            ? cn(
                'rounded-2xl rounded-br-md bg-[#d9fdd3] text-[#111b21] dark:bg-emerald-900/50 dark:text-emerald-50',
                showTail && 'rounded-br-sm',
              )
            : cn(
                'rounded-2xl rounded-bl-md bg-white text-[#111b21] dark:bg-[#262626] dark:text-white',
                showTail && 'rounded-bl-sm',
              ),
        )}
      >
        {!isMe && showName && (
          <p
            className="mb-0.5 text-[13px] font-semibold leading-tight"
            style={{ color: nameColor }}
          >
            {peerName}
          </p>
        )}
        {message.replyTo ? (
          <div
            className={cn(
              'mb-1.5 rounded-md border-l-[3px] px-2 py-1',
              isMe
                ? 'border-emerald-600/70 bg-emerald-950/5 dark:border-emerald-300/70 dark:bg-black/10'
                : 'border-[#25d366] bg-black/[0.04] dark:bg-white/5',
            )}
          >
            <p
              className={cn(
                'text-[12px] font-semibold leading-tight',
                isMe
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-[#25d366]',
              )}
            >
              {replySenderLabel(message.replyTo, peerName)}
            </p>
            <p className="line-clamp-2 text-[12px] leading-snug opacity-80">
              {message.replyTo.text}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
          <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[15px] font-medium leading-snug">
            {message.text}
          </p>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-0.5 self-end text-[11px] leading-none',
              isMe
                ? 'text-emerald-900/60 dark:text-emerald-100/70'
                : 'text-[#667781] dark:text-white/50',
            )}
          >
            {formatMessageTime(message.createdAt)}
            {isMe && <MessageStatusIcon status={message.pending ? 'pending' : message.status} />}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ChatView({
  chat: initialChat,
  currentUserId,
  embedded = false,
  onChatActivity,
  onListStatusChange,
}: ChatViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { chats } = useChatsContext();
  const { requestCall, activeCallChatId, liveCallId, callRevision } = useCallContext();
  const [chatMeta, setChatMeta] = React.useState(initialChat);
  const [newMessage, setNewMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isAvatarViewOpen, setIsAvatarViewOpen] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<ChatMessage | null>(null);
  const [forwardMessage, setForwardMessage] = React.useState<ChatMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = React.useState<ChatMessage | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [callLogs, setCallLogs] = React.useState<CallLogEntry[]>([]);
  const stickToBottomRef = React.useRef(false);
  const deliveredOnLoadRef = React.useRef<string | null>(null);
  const messagesRef = React.useRef<ChatMessage[]>([]);

  const {
    scrollRef,
    bottomRef,
    isNearBottomRef,
    showBackToLatest,
    isScrolling,
    handleScroll,
    scrollToLatest,
    scrollToLatestInstant,
  } = useChatScroll();

  const {
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
  } = useChatMessages({
    chatId: chatMeta.id,
    peerLastReadAt: chatMeta.peerLastReadAt,
  });

  messagesRef.current = messages;

  React.useEffect(() => {
    setChatMeta(initialChat);
  }, [initialChat]);

  React.useEffect(() => {
    let cancelled = false;

    getChatCallHistory(chatMeta.id)
      .then((entries) => {
        if (!cancelled) {
          setCallLogs(entries);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCallLogs([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chatMeta.id, callRevision]);

  const handleStartCall = (mode: 'audio' | 'video') => {
    requestCall({
      chatId: chatMeta.id,
      peerName: chatMeta.name,
      peerAvatar: chatMeta.avatar,
      mode,
    });
  };

  const appendMessage = React.useCallback(
    (message: ChatMessage) => {
      if (messagesRef.current.some((entry) => entry.id === message.id)) {
        return;
      }

      onChatActivity?.({
        latestMessage: message.text,
        timestamp: message.createdAt,
        senderId: message.senderId,
      });

      upsertMessage(message);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToLatestInstant());
      });
    },
    [onChatActivity, scrollToLatestInstant, upsertMessage],
  );

  const handleMessageDelivered = React.useCallback(
    (messageId: string) => {
      const current = markMessageDelivered(messagesRef.current, messageId);
      const latestOwn = [...current]
        .reverse()
        .find((message) => message.sender === 'me' && !message.pending);

      updateMessages((prev) => markMessageDelivered(prev, messageId));

      if (latestOwn?.id === messageId) {
        onListStatusChange?.('delivered');
      }
    },
    [onListStatusChange, updateMessages],
  );

  const handlePeerRead = React.useCallback(
    (readAt: string) => {
      updateMessages((prev) => applyPeerReadToMessages(prev, readAt));
      onListStatusChange?.('read');
    },
    [onListStatusChange, updateMessages],
  );

  const handleMessageDeleted = React.useCallback(
    (messageId: string) => {
      removeMessage((message) => message.id === messageId);
    },
    [removeMessage],
  );

  const handleCopyMessage = React.useCallback(async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Your browser blocked clipboard access.',
        variant: 'destructive',
      });
    }
  }, []);

  const handleReplyToMessage = React.useCallback((message: ChatMessage) => {
    setReplyingTo(message);
  }, []);

  const handleForwardMessage = React.useCallback((message: ChatMessage) => {
    setForwardMessage(message);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!messageToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteMessageFromChat(chatMeta.id, messageToDelete.id);
      removeMessage((message) => message.id === messageToDelete.id);
      setMessageToDelete(null);
      toast({ title: 'Message deleted' });
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not delete message',
        context: 'chat.delete',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [chatMeta.id, isDeleting, messageToDelete, removeMessage]);

  const handleCallRealtimeEvent = React.useCallback(
    (
      event:
        | 'call_invite'
        | 'call_accept'
        | 'call_decline'
        | 'call_end'
        | 'call_missed',
      payload: unknown,
    ) => {
      setCallLogs((prev) =>
        applyCallRealtimeEvent(
          prev,
          event,
          payload as Parameters<typeof applyCallRealtimeEvent>[2],
          chatMeta.id,
          currentUserId,
        ),
      );
    },
    [chatMeta.id, currentUserId],
  );

  const { typingName, notifyTyping, ackMessageDelivered } = useChatRealtime(
    chatMeta.id,
    currentUserId,
    user?.username ?? '',
    {
      onMessage: appendMessage,
      onMessageDelivered: handleMessageDelivered,
      onPeerRead: handlePeerRead,
      onMessageDeleted: handleMessageDeleted,
      onCallEvent: handleCallRealtimeEvent,
    },
  );

  React.useEffect(() => {
    if (deliveredOnLoadRef.current === chatMeta.id) {
      return;
    }

    if (isLoadingInitial || messages.length === 0) {
      return;
    }

    deliveredOnLoadRef.current = chatMeta.id;
    for (const message of messages) {
      if (message.sender === 'other') {
        ackMessageDelivered(message.id);
      }
    }
  }, [ackMessageDelivered, chatMeta.id, isLoadingInitial, messages]);

  React.useEffect(() => {
    if (isLoadingInitial) {
      return;
    }

    const hasUnreadFromPeer = messages.some((message) => message.sender === 'other');
    if (!hasUnreadFromPeer) {
      return;
    }

    void markChatRead(chatMeta.id).catch(() => undefined);
  }, [chatMeta.id, isLoadingInitial, messages.length]);

  React.useEffect(() => {
    if (!stickToBottomRef.current) {
      return;
    }

    scrollToLatestInstant();
  }, [messages, scrollToLatestInstant]);

  React.useEffect(() => {
    if (isLoadingInitial) {
      return;
    }

    requestAnimationFrame(() => scrollToLatestInstant());
  }, [chatMeta.id, isLoadingInitial, scrollToLatestInstant]);

  React.useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToLatest('smooth');
    }
  }, [typingName, isNearBottomRef, scrollToLatest]);

  const handleLoadOlder = () => {
    capturePrependScrollAnchor(scrollRef.current);
    void loadOlderMessages().then(() => {
      requestAnimationFrame(() => restorePrependScrollAnchor(scrollRef.current));
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || isSending) return;

    const optimisticId = `pending-${Date.now()}`;
    const replyTarget = replyingTo;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      sender: 'me',
      senderId: currentUserId,
      text,
      createdAt: new Date().toISOString(),
      pending: true,
      status: 'pending',
      ...(replyTarget
        ? {
            replyTo: {
              id: replyTarget.id,
              text: replyTarget.text,
              senderId: replyTarget.senderId,
              sender: replyTarget.sender,
            },
          }
        : {}),
    };

    setNewMessage('');
    setReplyingTo(null);
    setIsSending(true);
    stickToBottomRef.current = true;
    upsertMessage(optimisticMessage);
    scrollToLatestInstant();

    try {
      const saved = await addMessageToChat(chatMeta.id, text, {
        replyToMessageId: replyTarget?.id,
      });
      replaceMessage(
        (entry) => entry.id === optimisticId,
        { ...saved, status: saved.status ?? 'sent' },
      );
      scrollToLatestInstant();
      onChatActivity?.({
        latestMessage: text,
        timestamp: saved.createdAt,
        senderId: currentUserId,
        status: 'sent',
      });
    } catch (error) {
      stickToBottomRef.current = false;
      removeMessage((entry) => entry.id === optimisticId);
      setNewMessage(text);
      handleAsyncError(error, {
        title: 'Message not sent',
        context: 'chat.send',
      });
    } finally {
      setIsSending(false);
      window.setTimeout(() => {
        stickToBottomRef.current = false;
      }, 100);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      notifyTyping();
    }
  };

  const timeline = buildCombinedChatTimeline(messages, callLogs);
  const isCallLiveInChat = activeCallChatId === chatMeta.id;

  return (
    <div
      className={cn(
        'relative flex flex-col bg-[#efeae2] dark:bg-background',
        embedded ? 'h-full min-h-0' : 'h-[100dvh]',
      )}
    >
      <header className="z-10 flex shrink-0 items-center gap-3 border-b border-[#d1d7db] bg-[#f0f2f5] px-3 py-2 shadow-sm dark:border-border dark:bg-card md:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={() => router.push('/chats')}
        >
          ←
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAvatarViewOpen(true)}
            className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View ${chatMeta.name}'s profile photo`}
          >
            <Avatar className="size-10">
              <AvatarImage src={chatMeta.avatar} alt={chatMeta.name} />
              <AvatarFallback>{chatMeta.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {chatMeta.online && (
              <span className="pointer-events-none absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#f0f2f5] bg-[#25d366] dark:border-card" />
            )}
          </button>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#111b21] dark:text-foreground">
              {chatMeta.name}
            </p>
            <p className="truncate text-xs text-[#667781] dark:text-muted-foreground">
              {chatMeta.online ? 'online' : chatMeta.groupName}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[#54656f]">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Start video call with ${chatMeta.name}`}
            onClick={() => handleStartCall('video')}
          >
            <Video className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Start voice call with ${chatMeta.name}`}
            onClick={() => handleStartCall('audio')}
          >
            <Phone className="size-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-5" />
          </Button>
        </div>
      </header>

      {!isChatRealtimeEnabled() && (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Live updates need{' '}
          <code className="rounded bg-black/5 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-black/5 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
          <code className="rounded bg-black/5 px-1">frontend/.env</code>.
        </div>
      )}

      <main
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          'chat-scroll flex-1 overflow-y-auto px-4 py-4',
          isScrolling && 'chat-scroll--active',
        )}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      >
        {isLoadingInitial ? (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading messages…</p>
          </div>
        ) : messages.length === 0 && callLogs.length === 0 ? (
          <div className="flex h-full min-h-[12rem] items-center justify-center">
            <div className="rounded-xl bg-[#fff9] px-4 py-3 text-center text-sm text-muted-foreground shadow-sm backdrop-blur dark:bg-card/80">
              Messages are end-to-end inspired. Say hi to {chatMeta.name}!
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            {hasMoreOlder && (
              <div className="sticky top-0 z-10 flex justify-center py-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-white/95 shadow-sm backdrop-blur dark:bg-card/95"
                  onClick={handleLoadOlder}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <ChevronUp className="mr-1.5 size-4" />
                      Load earlier messages
                    </>
                  )}
                </Button>
              </div>
            )}

            {timeline.map((item, index) => {
              if (item.type === 'day') {
                return (
                  <div key={item.id} className="my-3 flex justify-center">
                    <span className="rounded-lg bg-[#ffffffd9] px-3 py-1 text-xs font-medium text-[#54656f] shadow-sm backdrop-blur dark:bg-muted dark:text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                );
              }

              if (item.type === 'call') {
                return (
                  <CallTimelineItem
                    key={item.id}
                    call={item.call}
                    peerName={chatMeta.name}
                    isLive={
                      isCallLiveInChat &&
                      (item.call.status === 'ongoing' ||
                        item.call.status === 'ringing') &&
                      item.call.id === liveCallId
                    }
                  />
                );
              }

              const prev = timeline[index - 1];
              const next = timeline[index + 1];
              const isMe = item.message.sender === 'me';

              const showName =
                !isMe &&
                (prev?.type !== 'message' || prev.message.sender !== item.message.sender);

              const showTail =
                next?.type !== 'message' ||
                next.message.sender !== item.message.sender;

              const showAvatar = !isMe && showTail;

              return (
                <MessageBubble
                  key={item.id}
                  message={item.message}
                  peerAvatar={chatMeta.avatar}
                  peerName={chatMeta.name}
                  showTail={showTail}
                  showName={showName}
                  showAvatar={showAvatar}
                  isVisible={isMe || visibleIds.has(item.message.id)}
                  onAvatarClick={() => setIsAvatarViewOpen(true)}
                  onCopy={() => void handleCopyMessage(item.message)}
                  onReply={() => handleReplyToMessage(item.message)}
                  onForward={() => handleForwardMessage(item.message)}
                  onDelete={
                    isMe && !item.message.pending
                      ? () => setMessageToDelete(item.message)
                      : undefined
                  }
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <div className="relative shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={() => scrollToLatest('smooth')}
          className={cn(
            'absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 rounded-full bg-[#25d366] px-4 text-white shadow-lg transition-all duration-300 hover:bg-[#20bd5a]',
            showBackToLatest
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-2 opacity-0',
          )}
        >
          <ArrowDown className="mr-1.5 size-4" />
          Back to latest
        </Button>

        <footer className="border-t border-[#d1d7db] bg-[#f0f2f5] px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-border dark:bg-card md:px-4">
          {replyingTo ? (
            <div className="mb-2 flex items-start gap-2 rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-muted">
              <div className="min-w-0 flex-1 border-l-[3px] border-[#25d366] pl-2">
                <p className="text-xs font-semibold text-[#25d366]">
                  {replyingTo.sender === 'me' ? 'You' : chatMeta.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {replyingTo.text}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                onClick={() => setReplyingTo(null)}
                aria-label="Cancel reply"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : null}
          {typingName && (
            <p className="mb-2 truncate px-1 text-xs text-[#667781] dark:text-muted-foreground">
              {typingName} is typing.
            </p>
          )}
          <form
            onSubmit={(e) => void handleSendMessage(e)}
            className="flex w-full items-end gap-2"
          >
            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-[#54656f]">
              <Smile className="size-5" />
            </Button>
            <div className="relative min-w-0 flex-1">
              <Input
                placeholder="Type a message"
                className="min-h-11 rounded-full border-0 bg-white px-4 py-6 shadow-sm dark:bg-muted"
                value={newMessage}
                onChange={handleInputChange}
                disabled={isSending}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="size-11 shrink-0 rounded-full bg-[#25d366] text-white hover:bg-[#20bd5a]"
              disabled={isSending || !newMessage.trim()}
            >
              {newMessage.trim() ? (
                <Send className="size-5" />
              ) : (
                <Check className="size-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </footer>
      </div>

      <AvatarViewModal
        open={isAvatarViewOpen}
        onOpenChange={setIsAvatarViewOpen}
        imageUrl={chatMeta.avatar}
        name={chatMeta.name}
      />

      <ForwardMessageDialog
        open={Boolean(forwardMessage)}
        onOpenChange={(open) => {
          if (!open) {
            setForwardMessage(null);
          }
        }}
        messageText={forwardMessage?.text ?? ''}
        currentChatId={chatMeta.id}
        chats={chats}
      />

      <AlertDialog
        open={Boolean(messageToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setMessageToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be removed for everyone in the chat. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
