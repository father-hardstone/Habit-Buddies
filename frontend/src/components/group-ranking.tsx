
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ArrowUp, ArrowDown, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getGroupById } from '@/lib/database';
import { handleAsyncError } from '@/lib/error-utils';
import { cn } from '@/lib/utils';
import { GroupRankingSkeleton } from '@/components/ui/skeleton-loaders';
import {
  MemberProfileModal,
  type GroupMember,
} from '@/components/member-profile-modal';

interface GroupRankingProps {
  groupId: string;
  currentUserId: string;
  refreshKey?: number;
  className?: string;
}

export function GroupRanking({
  groupId,
  currentUserId,
  refreshKey = 0,
  className,
}: GroupRankingProps) {
  const [group, setGroup] = React.useState<Awaited<ReturnType<typeof getGroupById>>>(null);
  const [selectedMember, setSelectedMember] = React.useState<GroupMember | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!groupId) {
      setGroup(null);
      return;
    }

    getGroupById(groupId)
      .then(setGroup)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load ranking',
          context: 'groupRanking',
        });
      });
  }, [groupId, refreshKey]);

  const openMemberProfile = (member: GroupMember) => {
    setSelectedMember(member);
    setProfileOpen(true);
  };

  if (!groupId) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle>Select a Group</CardTitle>
          <CardDescription>Choose a group from the tabs above to see the ranking.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!group) {
    return (
      <div className={cn('h-full min-h-0', className)}>
        <GroupRankingSkeleton />
      </div>
    );
  }

  const userIsAdmin = group.adminId === currentUserId;
  const groupMembers = group.members.sort((a, b) => a.rank - b.rank);
  const visibleMembers = groupMembers.slice(0, 4);

  return (
    <>
      <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>
        <CardHeader className="shrink-0 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>Your weekly progress ranking.</CardDescription>
            </div>
            {userIsAdmin && (
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                <Crown className="h-4 w-4" />
                <span>Admin</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col items-start pb-4">
          <ul className="w-full space-y-2">
            {visibleMembers.map((member, index) => (
              <li key={member.userId}>
                <button
                  type="button"
                  onClick={() => openMemberProfile(member)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/40',
                    member.userId === currentUserId && 'border-primary/30 bg-primary/10',
                  )}
                >
                  <span className="w-6 text-center text-lg font-bold text-muted-foreground">
                    {member.rank}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {member.userId === currentUserId ? 'You' : member.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.score.toFixed(1)} pts</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    {member.change === 'up' && <ArrowUp className="h-4 w-4 text-success" />}
                    {member.change === 'down' && <ArrowDown className="h-4 w-4 text-destructive" />}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-auto w-full shrink-0 pt-3">
                Show All Members
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>All Group Members</DialogTitle>
              </DialogHeader>
              <ul className="max-h-[60vh] space-y-2 overflow-y-auto p-1">
                {groupMembers.map((member) => (
                  <li key={member.userId}>
                    <button
                      type="button"
                      onClick={() => openMemberProfile(member)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-md p-2 text-left transition-colors hover:bg-muted/50',
                        member.userId === currentUserId && 'bg-primary/10',
                      )}
                    >
                      <span className="w-6 text-center font-bold text-muted-foreground">
                        {member.rank}
                      </span>
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-semibold">
                          {member.userId === currentUserId ? 'You' : member.name}
                          {member.isAdmin && <Crown className="h-4 w-4 text-warning" />}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.score.toFixed(1)} pts</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <MemberProfileModal
        member={selectedMember}
        groupId={groupId}
        groupName={group.name}
        currentUserId={currentUserId}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </>
  );
}
