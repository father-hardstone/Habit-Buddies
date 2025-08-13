
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ArrowUp, ArrowDown, MessageCircle, Crown, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChatPanel } from './chat-panel';
import { getGroupById } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { generateAccountabilityMessage } from '@/ai/flows/accountability-messages';

interface GroupRankingProps {
  groupId: string;
  currentUserId: number;
}

export function GroupRanking({ groupId, currentUserId }: GroupRankingProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [isNudging, setIsNudging] = React.useState<number | null>(null);
  const { toast } = useToast();
  
  const group = getGroupById(groupId);

  if (!group) {
    return <Card><CardHeader><CardTitle>Select a Group</CardTitle><CardDescription>Choose a group from the tabs above to see the ranking.</CardDescription></CardHeader></Card>;
  }

  const handleNudge = async (memberId: number, memberName: string) => {
    setIsNudging(memberId);
    try {
      const result = await generateAccountabilityMessage({
        userName: memberName,
        habitName: 'their habits', // A more generic phrase for now
        groupName: group.name,
        missedDays: 3, // Example value
      });

      toast({
        title: `Nudge for ${memberName}!`,
        description: result.message,
      });

    } catch (error) {
       console.error(error);
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not generate nudge. Please try again.',
      });
    } finally {
        setIsNudging(null);
    }
  }

  const userIsAdmin = group.adminId === currentUserId;
  const groupMembers = group.members.sort((a,b) => a.rank - b.rank);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>"{group.name}" Ranking</CardTitle>
                <CardDescription>Your weekly progress ranking.</CardDescription>
            </div>
             {userIsAdmin && (
                <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
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
                <p className="font-semibold">{member.userId === currentUserId ? 'You' : member.name}</p>
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
                    <p className="font-semibold">{member.userId === currentUserId ? 'You' : member.name}</p>
                     <p className="text-sm text-muted-foreground">{member.score} points</p>
                  </div>
                  {member.userId !== currentUserId && (
                    <div className="flex items-center">
                      {member.change === 'down' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleNudge(member.userId, member.name)}
                          disabled={isNudging === member.userId}
                          className="text-accent hover:text-accent"
                        >
                          {isNudging === member.userId ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                          <span className="sr-only">Nudge {member.name}</span>
                        </Button>
                      )}
                      <ChatPanel member={member} groupName={group.name}>
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="h-5 w-5" />
                          <span className="sr-only">Message {member.name}</span>
                        </Button>
                      </ChatPanel>
                    </div>
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
