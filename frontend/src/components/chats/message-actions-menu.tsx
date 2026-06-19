'use client';

import {
  Copy,
  Forward,
  MoreVertical,
  Reply,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type MessageActionsMenuProps = {
  isMe: boolean;
  canDelete: boolean;
  onCopy: () => void;
  onReply: () => void;
  onForward: () => void;
  onDelete?: () => void;
};

export function MessageActionsMenu({
  isMe,
  canDelete,
  onCopy,
  onReply,
  onForward,
  onDelete,
}: MessageActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-[#54656f] opacity-0 transition-opacity',
            'hover:bg-black/5 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'group-hover/message:opacity-100 dark:text-muted-foreground dark:hover:bg-white/10',
            'data-[state=open]:opacity-100',
          )}
          aria-label="Message options"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMe ? 'end' : 'start'}
        side="top"
        className="min-w-[10rem]"
      >
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }}
        >
          <Copy />
          Copy text
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onReply();
          }}
        >
          <Reply />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onForward();
          }}
        >
          <Forward />
          Forward
        </DropdownMenuItem>
        {canDelete && onDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
