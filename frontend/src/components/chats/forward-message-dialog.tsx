'use client';

import * as React from 'react';
import { Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addMessageToChat, type Chat } from '@/lib/database';
import { handleAsyncError } from '@/lib/error-utils';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ForwardMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageText: string;
  currentChatId: string;
  chats: Chat[];
};

export function ForwardMessageDialog({
  open,
  onOpenChange,
  messageText,
  currentChatId,
  chats,
}: ForwardMessageDialogProps) {
  const [query, setQuery] = React.useState('');
  const [forwardingTo, setForwardingTo] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setForwardingTo(null);
    }
  }, [open]);

  const candidates = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return chats
      .filter((chat) => chat.id !== currentChatId)
      .filter((chat) => {
        if (!normalized) {
          return true;
        }

        return (
          chat.name.toLowerCase().includes(normalized) ||
          chat.groupName.toLowerCase().includes(normalized)
        );
      });
  }, [chats, currentChatId, query]);

  const handleForward = async (chat: Chat) => {
    if (forwardingTo) {
      return;
    }

    setForwardingTo(chat.id);

    try {
      await addMessageToChat(chat.id, messageText);
      toast({
        title: 'Message forwarded',
        description: `Sent to ${chat.name}`,
      });
      onOpenChange(false);
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not forward message',
        context: 'chat.forward',
      });
    } finally {
      setForwardingTo(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(32rem,85vh)] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward message</DialogTitle>
          <DialogDescription>
            Choose a chat to forward this message to.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats"
            className="pl-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto rounded-md border">
          {candidates.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No other chats found.
            </p>
          ) : (
            <ul className="divide-y">
              {candidates.map((chat) => {
                const isSending = forwardingTo === chat.id;

                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      disabled={Boolean(forwardingTo)}
                      onClick={() => void handleForward(chat)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        'hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-60',
                      )}
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={chat.avatar} alt={chat.name} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{chat.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {chat.groupName}
                        </p>
                      </div>
                      {isSending ? (
                        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
