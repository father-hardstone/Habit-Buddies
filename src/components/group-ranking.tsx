
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ArrowUp, ArrowDown, MessageCircle, Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChatPanel } from './chat-panel';
import { getGroupById } from '@/lib/database';

const CURRENT_USER_ID = 1;

interface GroupRankingProps {
  groupId: string;
}

export function GroupRanking({ groupId }: GroupRankingProps) {
  const [showAll, setShowAll] = React.useState(false);
  
  const group = getGroupById(groupId);

  if (!group) {
    return <Card><CardHeader><CardTitle>Group not found</CardTitle></CardHeader></Card>;
  }

  const userIsAdmin = group.adminId === CURRENT_USER_ID;
  const groupMembers = group.members.sort((a,b) => a.rank - b.rank);
  const me = group.members.find(m => m.userId === CURRENT_USER_ID);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Group: "{group.name}"</CardTitle>
                <CardDescription>Your weekly progress ranking.</CardDescription>
            </div>
             {userIsAdmin && (
                <div className="flex items-center gap-2 text-xs font-semibold text-warning bg-warning/10 px-2 py-1 rounded-md">
                    <Crown className="h-4 w-4" />
                    <span>You are an admin</span>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {groupMembers.slice(0, 4).map((member, index) => (
            <li key={member.userId} className="flex items-center gap-4">
              <span className="text-lg font-bold text-muted-foreground">{member.rank}</span>
              <Avatar>
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{member.userId === CURRENT_USER_ID ? 'You' : member.name}</p>
                <p className="text-sm text-muted-foreground">{member.score} points</p>
              </div>
              <div className="flex items-center gap-1">
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                {member.change === 'up' && <ArrowUp className="h-4 w-4 text-success" />}
                {member.change === 'down' && <ArrowDown className="h-4 w-4 text-destructive" />}
              </div>
            </li>
          ))}
        </ul>

         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-4">Show All Members</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>All Group Members</DialogTitle>
            </DialogHeader>
            <ul className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
              {groupMembers.map((member) => (
                <li key={member.userId} className="flex items-center gap-4">
                  <span className="font-bold text-muted-foreground w-6 text-center">{member.rank}</span>
                   <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{member.userId === CURRENT_USER_ID ? 'You' : member.name}</p>
                     <p className="text-sm text-muted-foreground">{member.score} points</p>
                  </div>
                  {member.userId !== CURRENT_USER_ID && (
                    <ChatPanel member={member} groupName={group.name}>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
                        <span className="sr-only">Message {member.name}</span>
                      </Button>
                    </ChatPanel>
                  )}
                   {member.isAdmin && (
                     <Crown className="h-5 w-5 text-warning" />
                  )}
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
