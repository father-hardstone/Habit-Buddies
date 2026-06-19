'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chat } from '@/lib/database';
import { formatChatListTime } from '@/lib/chat-time';
import { useAuth } from '@/hooks/use-auth';
import { useChatsContext } from '@/components/chats/chats-context';
import {
  clipChatPreview,
  MessageStatusIcon,
} from '@/components/chats/message-status-icon';

function ChatListMessagePreview({
  chat,
  currentUserId,
}: {
  chat: Chat;
  currentUserId: string;
}) {
  const isMine = chat.lastMessageSenderId === currentUserId;
  const preview = clipChatPreview(chat.latestMessage);

  if (!isMine) {
    return (
      <span className="block truncate">{preview}</span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="shrink-0">You:</span>
      <span className="min-w-0 truncate">{preview}</span>
      <MessageStatusIcon status={chat.lastMessageStatus ?? 'sent'} />
    </span>
  );
}

const ChatListItem = React.memo(function ChatListItem({
  chat,
  isActive,
  currentUserId,
  onSelect,
}: {
  chat: Chat;
  isActive: boolean;
  currentUserId: string;
  onSelect: (chatId: string) => void;
}) {
  const hasUnread = chat.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(chat.id)}
      className={cn(
        'flex w-full items-center gap-3 border-b border-[#e9edef] px-3 py-3 text-left transition-colors hover:bg-[#f5f6f6] dark:border-border dark:hover:bg-muted/40',
        isActive && 'bg-[#f0f2f5] dark:bg-muted/50',
        hasUnread && !isActive && 'bg-[#f0f2f5]/80 dark:bg-muted/30',
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-12">
          <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.aiHint} />
          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {chat.online && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#25d366] dark:border-card" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'truncate text-[17px] text-[#111b21] dark:text-foreground',
              hasUnread ? 'font-semibold' : 'font-normal',
            )}
          >
            {chat.name}
          </p>
          <p
            className={cn(
              'shrink-0 text-xs',
              hasUnread
                ? 'font-medium text-[#25d366]'
                : 'text-[#667781] dark:text-muted-foreground',
            )}
          >
            {formatChatListTime(chat.timestamp)}
          </p>
        </div>

        <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          <p
            className={cn(
              'min-w-0 flex-1 truncate text-sm text-[#667781] dark:text-muted-foreground',
              hasUnread && 'font-medium text-[#111b21] dark:text-foreground',
            )}
          >
            <ChatListMessagePreview chat={chat} currentUserId={currentUserId} />
          </p>
          {hasUnread && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[11px] font-semibold text-white">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export function ChatListPanel({ className }: { className?: string }) {
  const { user } = useAuth();
  const { chats, isLoading, selectedChatId, selectChat } = useChatsContext();
  const [search, setSearch] = React.useState('');

  const filteredChats = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return chats;
    }

    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(query) ||
        chat.latestMessage.toLowerCase().includes(query) ||
        chat.groupName.toLowerCase().includes(query),
    );
  }, [chats, search]);

  if (!user) {
    return null;
  }

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full flex-col border-r border-[#d1d7db] bg-white dark:border-border dark:bg-card md:w-[400px] md:max-w-[40%] md:shrink-0',
        className,
      )}
    >
      <header className="shrink-0 border-b border-[#d1d7db] bg-[#f0f2f5] px-4 py-4 dark:border-border dark:bg-card">
        <h1 className="mb-3 text-xl font-semibold text-[#111b21] dark:text-foreground">
          Chats
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="rounded-lg border-0 bg-white pl-9 shadow-sm dark:bg-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-3 border-b border-[#e9edef] px-3 py-3 dark:border-border"
              >
                <div className="size-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 rounded bg-muted" />
                  <div className="h-3 w-3/5 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted-foreground">
            <p className="font-medium text-foreground">No chats yet</p>
            <p className="mt-1 text-sm">
              Open a group member&apos;s profile and tap Start chat.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === selectedChatId}
              currentUserId={user.id}
              onSelect={selectChat}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export function ChatEmptyPane() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#efeae2] px-6 text-center dark:bg-background">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-[#f0f2f5] dark:bg-muted">
        <MessageSquare className="size-12 text-[#667781] dark:text-muted-foreground" strokeWidth={1.25} />
      </div>
      <h2 className="text-2xl font-light text-[#41525d] dark:text-foreground">
        Habit Buddies Web
      </h2>
      <p className="mt-3 max-w-sm text-sm text-[#667781] dark:text-muted-foreground">
        Select a chat from the list to start messaging. Press{' '}
        <kbd className="rounded border border-[#d1d7db] bg-white px-1.5 py-0.5 text-xs dark:border-border dark:bg-muted">
          Esc
        </kbd>{' '}
        or click the active chat again to close it.
      </p>
    </div>
  );
}
