'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Loader2,
  MessageCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateAccountabilityMessage } from '@/ai/flows/accountability-messages';
import { createDirectChat, type GroupWithMembers } from '@/lib/database';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';
import { AvatarViewModal } from '@/components/avatar-view-modal';
import { cn } from '@/lib/utils';

export type GroupMember = NonNullable<GroupWithMembers>['members'][number];

type MemberProfileModalProps = {
  member: GroupMember | null;
  groupId: string;
  groupName: string;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemberProfileModal({
  member,
  groupId,
  groupName,
  currentUserId,
  open,
  onOpenChange,
}: MemberProfileModalProps) {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);
  const [isNudging, setIsNudging] = React.useState(false);
  const [isAvatarViewOpen, setIsAvatarViewOpen] = React.useState(false);

  if (!member) {
    return null;
  }

  const isSelf = member.userId === currentUserId;
  const displayName = isSelf ? 'You' : member.name;

  const handleStartChat = async () => {
    if (isSelf) return;

    setIsCreatingChat(true);
    try {
      const { chatId } = await createDirectChat(member.userId, groupId);
      onOpenChange(false);
      router.push(`/chats/${chatId}`);
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not open chat',
        context: 'memberProfile.chat',
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleNudge = async () => {
    setIsNudging(true);
    try {
      const result = await generateAccountabilityMessage({
        userName: member.name,
        habitName: 'their habits',
        groupName,
        missedDays: 3,
      });
      showSuccessToast(`Nudge for ${member.name}!`, result.message);
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not send nudge',
        fallback: 'Could not generate nudge. Please try again.',
        context: 'memberProfile.nudge',
      });
    } finally {
      setIsNudging(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="sr-only">
          <DialogTitle>{displayName}</DialogTitle>
          <DialogDescription>Group member profile</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAvatarViewOpen(true)}
              className="rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`View ${member.name}'s profile photo`}
            >
              <Avatar className="size-24 ring-4 ring-background shadow-md">
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
            {member.online && (
              <span className="pointer-events-none absolute bottom-1 right-1 size-4 rounded-full border-2 border-background bg-success" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <h2 className="text-xl font-bold font-headline">{displayName}</h2>
              {member.isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="size-3" />
                  Admin
                </Badge>
              )}
              {member.rank === 1 && (
                <Badge className="gap-1 bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400">
                  <Trophy className="size-3" />
                  #1
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{groupName}</p>
          </div>

          <div className="grid w-full grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rank</p>
              <p className="text-lg font-semibold">#{member.rank}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Weekly pts</p>
              <p className="text-lg font-semibold">{member.score.toFixed(1)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className="flex items-center justify-center gap-1 text-lg font-semibold">
                {member.change === 'up' && (
                  <>
                    <ArrowUp className="size-4 text-success" />
                    Up
                  </>
                )}
                {member.change === 'down' && (
                  <>
                    <ArrowDown className="size-4 text-destructive" />
                    Down
                  </>
                )}
                {member.change !== 'up' && member.change !== 'down' && '—'}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            {isSelf ? (
              <Button variant="outline" disabled className="w-full gap-2">
                <MessageCircle className="size-4" />
                Chat with yourself
              </Button>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={() => void handleStartChat()}
                disabled={isCreatingChat}
              >
                {isCreatingChat ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Opening chat…
                  </>
                ) : (
                  <>
                    <MessageCircle className="size-4" />
                    Start chat
                  </>
                )}
              </Button>
            )}

            {!isSelf && member.change === 'down' && (
              <Button
                variant="outline"
                className={cn('w-full gap-2', 'text-accent hover:text-accent')}
                onClick={() => void handleNudge()}
                disabled={isNudging}
              >
                {isNudging ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending nudge…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Send nudge
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      </Dialog>

      <AvatarViewModal
        open={isAvatarViewOpen}
        onOpenChange={setIsAvatarViewOpen}
        imageUrl={member.avatar}
        name={displayName}
      />
    </>
  );
}
