
'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type Member = {
  name: string;
  score: number;
  rank: number;
  avatar: string;
  online: boolean;
};

interface ChatPanelProps {
  member: Member;
  children: React.ReactNode;
}

const messages = [
    { id: 1, sender: 'other', text: 'Hey, great job on the streak this week!' },
    { id: 2, sender: 'me', text: 'Thanks! You too. That last challenge was tough.' },
    { id: 3, sender: 'other', text: 'For sure. Ready for the next one?' },
];

export function ChatPanel({ member, children }: ChatPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {member.online && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
              )}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left">{member.name}</SheetTitle>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Procrasti-haters</span>
                <Badge variant="secondary">Rank #{member.rank}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex items-end gap-2', {
                'justify-end': message.sender === 'me',
              })}
            >
              {message.sender === 'other' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn('max-w-[75%] rounded-lg p-3 text-sm', {
                  'bg-primary text-primary-foreground': message.sender === 'me',
                  'bg-muted': message.sender === 'other',
                })}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t bg-background">
          <div className="relative">
            <Input placeholder="Type a message..." className="pr-12" />
            <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
