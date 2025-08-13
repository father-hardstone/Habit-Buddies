
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Users, User, Smile, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Smile className="size-5" />
      </div>
      <h1 className="text-lg font-bold text-foreground font-headline">Habit Buddies</h1>
    </Link>
  );
}

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/chats', label: 'Chats', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">User Name</span>
              <span className="text-xs text-muted-foreground">user@email.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
