
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import type { Chat } from '@/lib/data';

interface ChatViewProps {
  chat: Chat;
}

export function ChatView({ chat }: ChatViewProps) {
  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm">
        <Link href="/chats">
            <Button variant="ghost" size="icon">
                <ArrowLeft />
                <span className="sr-only">Back to chats</span>
            </Button>
        </Link>
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {chat.online && (
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{chat.name}</p>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{chat.groupName}</span>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex items-end gap-2', {
              'justify-end': message.sender === 'me',
            })}
          >
            {message.sender === 'other' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
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
      </main>
      <footer className="p-4 border-t bg-background">
        <div className="relative">
          <Input placeholder="Type a message..." className="pr-12" />
          <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
