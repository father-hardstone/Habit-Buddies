
import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const chats = [
  {
    id: '1',
    name: 'Alex',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'For sure. Ready for the next one?',
    timestamp: '10:42 AM',
    unreadCount: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Jess',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'I\'m a bit stuck on the meditation habit. Any tips?',
    timestamp: '9:30 AM',
    unreadCount: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Mo',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'Let\'s crush our goals this week! 💪',
    timestamp: 'Yesterday',
    unreadCount: 0,
    online: true,
  },
  {
    id: '4',
    name: 'Sara',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'Great idea! I\'ll create a new challenge for us.',
    timestamp: '2 days ago',
    unreadCount: 5,
    online: false,
  },
   {
    id: '5',
    name: 'Ben',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'user avatar',
    latestMessage: 'Anyone read any good books lately?',
    timestamp: '3 days ago',
    unreadCount: 0,
    online: true,
  },
];

export default function ChatsPage() {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-headline">Chats</h1>
            <p className="text-muted-foreground">Your recent conversations.</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-9 w-full" />
          </div>
        </header>
        <main className="flex-1">
          <div className="divide-y">
            {chats.map((chat) => (
              <Link href="#" key={chat.id} className={cn(
                  "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                  chat.unreadCount > 0 && "bg-secondary/50 hover:bg-secondary"
                )}>
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.aiHint} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-semibold">{chat.name}</p>
                    <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={cn(
                        "text-sm text-muted-foreground truncate max-w-[200px] md:max-w-xs",
                         chat.unreadCount > 0 && "font-bold text-foreground"
                    )}>
                      {chat.latestMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge className="w-6 h-6 flex items-center justify-center p-0">{chat.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
             {chats.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    <p>You have no active chats.</p>
                    <p className="text-sm">Start a conversation from the group members list.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}
