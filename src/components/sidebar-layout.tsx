
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
import { Home, Users, User, Smile, MessageSquare, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 p-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Smile className="size-5" />
      </div>
      <h1 className="text-lg font-bold text-sidebar-foreground font-headline">Habit Buddies</h1>
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
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar className="transition-colors duration-200">
        <SidebarHeader className="border-b border-sidebar-border">
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
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
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
        <SidebarFooter className="border-t border-sidebar-border">
          {user && user.username ? (
            <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileUrl} alt="User avatar" data-ai-hint="user avatar" />
                        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-sidebar-foreground">{user.username}</span>
                        <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <LogOut className="mr-2 h-4 w-4"/>
                    Log Out
                </Button>
            </div>
          ) : (
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">Not logged in</span>
                </div>
              </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
