import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import {
  AdminGroupsSkeleton,
  AdminOverviewSkeleton,
  AdminShellSkeleton,
  AdminUsersSkeleton,
  AppShellSkeleton,
  AuthPageSkeleton,
  ChatDetailSkeleton,
  ChatsListSkeleton,
  DashboardSkeleton,
  GenericContentSkeleton,
  GroupsGridSkeleton,
  ProfileSkeleton,
} from '@/components/ui/skeleton-loaders';

export type PageLoaderVariant =
  | 'app-shell'
  | 'dashboard'
  | 'groups'
  | 'chats'
  | 'chat'
  | 'profile'
  | 'auth'
  | 'generic'
  | 'admin-shell'
  | 'admin-overview'
  | 'admin-users'
  | 'admin-groups';

type PageLoaderProps = {
  variant?: PageLoaderVariant;
  className?: string;
  fullScreen?: boolean;
};

const variantComponents: Record<PageLoaderVariant, ComponentType> = {
  'app-shell': AppShellSkeleton,
  dashboard: DashboardSkeleton,
  groups: GroupsGridSkeleton,
  chats: ChatsListSkeleton,
  chat: ChatDetailSkeleton,
  profile: ProfileSkeleton,
  auth: AuthPageSkeleton,
  generic: GenericContentSkeleton,
  'admin-shell': AdminShellSkeleton,
  'admin-overview': AdminOverviewSkeleton,
  'admin-users': AdminUsersSkeleton,
  'admin-groups': AdminGroupsSkeleton,
};

export function PageLoader({
  variant = 'app-shell',
  className,
  fullScreen = false,
}: PageLoaderProps) {
  const Component = variantComponents[variant];

  if (variant === 'generic') {
    return (
      <div
        className={cn(
          'flex w-full flex-1 items-center justify-center p-8',
          fullScreen ? 'min-h-screen' : 'min-h-[50vh]',
          className,
        )}
      >
        <GenericContentSkeleton />
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={cn('flex h-full min-h-0 w-full flex-col overflow-hidden', className)}>
        <Component />
      </div>
    );
  }

  if (variant === 'auth') {
    return (
      <div className={cn(fullScreen ? 'min-h-screen w-full' : 'w-full', className)}>
        <Component />
      </div>
    );
  }

  return (
    <div className={cn(fullScreen ? 'min-h-screen w-full' : 'w-full flex-1', className)}>
      <Component />
    </div>
  );
}
