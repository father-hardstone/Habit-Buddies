'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ArrowUp, ArrowDown, MessageCircle, Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChatPanel } from './chat-panel';

const groupMembers = [
  { name: 'You', score: 1250, rank: 1, avatar: 'https://placehold.co/40x40.png', change: 'up', isAdmin: true, online: true },
  { name: 'Alex', score: 1100, rank: 2, avatar: 'https://placehold.co/40x40.png', change: 'down', isAdmin: false, online: true },
  { name: 'Jess', score: 980, rank: 3, avatar: 'https://placehold.co/40x40.png', change: 'up', isAdmin: false, online: false },
  { name: 'Mo', score: 950, rank: 4, avatar: 'https://placehold.co/40x40.png', change: 'down', isAdmin: false, online: true },
  { name: 'Sara', score: 920, rank: 5, avatar: 'https://placehold.co/40x40.png', change: 'up', isAdmin: false, online: false },
  { name: 'Ben', score: 880, rank: 6, avatar: 'https://placehold.co/40x40.png', change: 'down', isAdmin: false, online: true },
];

export function GroupRanking() {
  const [showAll, setShowAll] = React.useState(false);
  const userIsAdmin = groupMembers.find(m => m.name === 'You')?.isAdmin || false;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Group: "Procrasti-haters"</CardTitle>
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
            <li key={member.name} className="flex items-center gap-4">
              <span className="text-lg font-bold text-muted-foreground">{member.rank}</span>
              <Avatar>
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{member.name}</p>
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
                <li key={member.name} className="flex items-center gap-4">
                  <span className="font-bold text-muted-foreground w-6 text-center">{member.rank}</span>
                   <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                     <p className="text-sm text-muted-foreground">{member.score} points</p>
                  </div>
                  {member.name !== 'You' && (
                    <ChatPanel member={member}>
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
