
'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getChatsForUser } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';


function ChatsPageContent() {
  const { user } = useAuth();
  const chats = getChatsForUser(user!.id);

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
              <Link href={`/chats/${chat.id}`} key={chat.id} className="block transition-colors hover:bg-muted/50">
                <div className={cn(
                  "flex items-center gap-4 p-4",
                  chat.unreadCount > 0 && "bg-secondary/50"
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
                      <p className="text-xs text-muted-foreground">{chat.formattedTimestamp}</p>
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

export default function ChatsPage() {
    return (
        <ProtectedRoute>
            <ChatsPageContent />
        </ProtectedRoute>
    )
}
