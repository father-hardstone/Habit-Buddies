'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ChatListPanel } from '@/components/chats/chat-list-panel';
import { cn } from '@/lib/utils';

function getSelectedChatId(pathname: string): string | null {
  const match = pathname.match(/^\/chats\/([^/]+)$/);
  return match?.[1] ?? null;
}

function ChatsLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selectedChatId = getSelectedChatId(pathname);
  const isChatOpen = Boolean(selectedChatId);

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#f0f2f5] dark:bg-background">
      <ChatListPanel
        className={cn(isChatOpen && 'hidden md:flex')}
      />
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          !isChatOpen && 'hidden md:flex',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return <ChatsLayoutInner>{children}</ChatsLayoutInner>;
}
