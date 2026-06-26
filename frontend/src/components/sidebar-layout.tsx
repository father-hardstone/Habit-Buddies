
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
  SidebarMenuBadge,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Users, Smile, MessageSquare, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { NavLinkIcon, NavLinkLabel } from './nav-link-status';
import { useUnreadChatsCount } from '@/components/chats/chats-context';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function Logo() {
  return (
    <Link href="/" prefetch className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-sidebar-accent/60">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <Smile className="size-5" />
      </div>
      <h1 className="truncate text-lg font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        Habit Buddies
      </h1>
    </Link>
  );
}

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home, match: (path: string) => path === '/' },
  { href: '/groups', label: 'Groups', icon: Users, match: (path: string) => path.startsWith('/groups') },
  { href: '/chats', label: 'Chats', icon: MessageSquare, match: (path: string) => path.startsWith('/chats') },
];

function SidebarNavLink({
  href,
  label,
  icon,
  isActive,
  onNavigate,
  badgeCount = 0,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: boolean;
  onNavigate: () => void;
  badgeCount?: number;
}) {
  const showBadge = badgeCount > 0;
  const badgeLabel = badgeCount > 99 ? '99+' : String(badgeCount);

  return (
    <SidebarMenuItem className="relative">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={showBadge ? `${label} (${badgeLabel} unread)` : label}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm"
      >
        <Link href={href} prefetch onClick={onNavigate}>
          <NavLinkIcon icon={icon} />
          <NavLinkLabel label={label} />
        </Link>
      </SidebarMenuButton>
      {showBadge && (
        <SidebarMenuBadge className="bg-[#25d366] text-[10px] text-white peer-data-[active=true]/menu-button:text-white">
          {badgeLabel}
        </SidebarMenuBadge>
      )}
      {showBadge && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-1.5 top-1.5 hidden size-2 rounded-full bg-[#25d366] group-data-[collapsible=icon]:block"
        />
      )}
    </SidebarMenuItem>
  );
}

function SidebarProfileCard({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isProfileActive = pathname === '/profile';

  if (!user?.username) {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2">
        <Avatar className="size-9">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <span className="text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          Not signed in
        </span>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/profile"
        prefetch
        onClick={onNavigate}
        className={cn(
          'flex min-w-0 items-center gap-3 rounded-lg p-2 transition-colors group-data-[collapsible=icon]:hidden',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          isProfileActive &&
            'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground',
        )}
      >
        <Avatar className="size-9 shrink-0 ring-2 ring-sidebar-border">
          <AvatarImage src={user.profileUrl} alt="" data-ai-hint="user avatar" />
          <AvatarFallback className="text-sm font-semibold">
            {user.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{user.username}</p>
          <p
            className={cn(
              'truncate text-xs leading-tight',
              isProfileActive ? 'text-sidebar-primary-foreground/80' : 'text-sidebar-foreground/60',
            )}
          >
            {user.email}
          </p>
        </div>
        <ChevronRight className={cn('size-4 shrink-0 opacity-60', isProfileActive && 'opacity-100')} />
      </Link>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/profile"
            prefetch
            onClick={onNavigate}
            className={cn(
              'hidden size-9 items-center justify-center rounded-lg group-data-[collapsible=icon]:flex',
              isProfileActive && 'ring-2 ring-sidebar-primary',
            )}
            aria-label="Open profile"
          >
            <Avatar className="size-8">
              <AvatarImage src={user.profileUrl} alt="" />
              <AvatarFallback className="text-xs">{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{user.username} · Profile</TooltipContent>
      </Tooltip>
    </>
  );
}

function SidebarLogoutButton() {
  const { logout, isLoggingOut } = useAuth();
  const [isLogoutPending, setIsLogoutPending] = React.useState(false);

  const handleLogout = () => {
    setIsLogoutPending(true);
    logout();
  };

  const isPending = isLogoutPending || isLoggingOut;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
      >
        <LogOut className="mr-2 size-4" />
        {isPending ? 'Signing out...' : 'Log out'}
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isPending}
            className="hidden size-9 group-data-[collapsible=icon]:flex"
            aria-label={isPending ? 'Signing out' : 'Log out'}
          >
            <LogOut className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{isPending ? 'Signing out...' : 'Log out'}</TooltipContent>
      </Tooltip>
    </>
  );
}

function SidebarLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
  const unreadChatsCount = useUnreadChatsCount();

  const closeMobile = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const isChatsRoute = pathname.startsWith('/chats');
  const isViewportLockedRoute =
    isChatsRoute || pathname === '/' || pathname.startsWith('/groups');

  React.useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="inset"
        className="border-sidebar-border"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarHeader className="border-b border-sidebar-border/80 pb-3">
          <Logo />
        </SidebarHeader>

        <SidebarContent className="px-1 pt-2">
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarNavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={item.match(pathname)}
                    onNavigate={closeMobile}
                    badgeCount={item.href === '/chats' ? unreadChatsCount : 0}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-2 border-t border-sidebar-border/80 pt-2">
          <ThemeToggle variant="sidebar" />
          <SidebarProfileCard onNavigate={closeMobile} />
          <SidebarLogoutButton />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset
        className={cn(
          'flex min-h-svh flex-col overflow-x-hidden bg-muted/30 md:min-h-[calc(100svh-1rem)]',
          isViewportLockedRoute
            ? 'h-svh max-h-svh overflow-hidden lg:h-[calc(100svh-1rem)] lg:max-h-[calc(100svh-1rem)]'
            : 'overflow-y-auto lg:h-[calc(100svh-1rem)] lg:max-h-[calc(100svh-1rem)] lg:overflow-hidden',
        )}
      >
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            isViewportLockedRoute ? 'overflow-hidden' : 'lg:overflow-hidden',
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarLayoutInner>{children}</SidebarLayoutInner>
    </SidebarProvider>
  );
}
