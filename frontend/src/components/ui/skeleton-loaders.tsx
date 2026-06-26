import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar p-4 gap-6',
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
      <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4 p-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </aside>
  );
}

function PageHeaderSkeleton({
  lines = 2,
  action = false,
  search = false,
}: {
  lines?: number;
  action?: boolean;
  search?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-5', i === 0 ? 'w-48 h-7' : 'w-64')}
            />
          ))}
        </div>
        {action && <Skeleton className="h-10 w-32 shrink-0 rounded-md" />}
      </div>
      {search && (
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      )}
    </header>
  );
}

export function AppShellSkeleton({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex min-h-screen w-full', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <SidebarSkeleton />
      <div className="flex min-h-screen flex-1 flex-col">
        {children ?? (
          <>
            <PageHeaderSkeleton />
            <div className="flex flex-1 items-center justify-center p-8">
              <GenericContentSkeleton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function GenericContentSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4 scrollbar-thin md:p-5 lg:overflow-hidden lg:p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading group data"
    >
      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:gap-5 lg:overflow-hidden">
        <div className="flex flex-col gap-4 lg:col-span-2 lg:min-h-0 lg:overflow-hidden">
          <div className="space-y-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-64 w-full shrink-0 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-1 lg:min-h-0 lg:overflow-hidden">
          <GroupRankingSkeleton />
          <Skeleton className="h-48 w-full shrink-0 rounded-xl" />
        </div>
      </div>
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden lg:h-full lg:max-h-full"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:px-8 md:py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>
      </header>
      <DashboardContentSkeleton />
    </div>
  );
}

export function RouteContentSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <GenericContentSkeleton />
    </div>
  );
}

export function GroupsGridContentSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupsPageSkeleton() {
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden lg:h-full lg:max-h-full">
      <PageHeaderSkeleton lines={2} search action />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 scrollbar-thin md:p-6 lg:p-8">
        <GroupsGridContentSkeleton />
      </main>
    </div>
  );
}

export function GroupsGridSkeleton() {
  return (
    <AppShellSkeleton>
      <GroupsPageSkeleton />
    </AppShellSkeleton>
  );
}

export function ChatsListContentSkeleton() {
  return (
    <div className="divide-y bg-card">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatsPageSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeaderSkeleton lines={2} />
      <main className="flex-1">
        <ChatsListContentSkeleton />
      </main>
    </div>
  );
}

export function ChatsListSkeleton() {
  return (
    <AppShellSkeleton>
      <ChatsPageSkeleton />
    </AppShellSkeleton>
  );
}

export function ChatDetailContentSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}
          >
            <Skeleton
              className={cn(
                'h-12 rounded-2xl',
                i % 2 === 0 ? 'w-2/5' : 'w-1/3',
              )}
            />
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ChatDetailSkeleton() {
  return (
    <AppShellSkeleton>
      <ChatDetailContentSkeleton />
    </AppShellSkeleton>
  );
}

export function ProfilePageContentSkeleton() {
  return (
    <main
      className="flex-1 p-4 md:p-6 lg:p-8"
      role="status"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-6 shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          <Skeleton className="h-6 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-md" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function ProfileSkeleton() {
  return (
    <AppShellSkeleton>
      <PageHeaderSkeleton lines={1} action />
      <ProfilePageContentSkeleton />
    </AppShellSkeleton>
  );
}

export function GroupRankingSkeleton() {
  return (
    <div className="rounded-xl border p-6 space-y-4">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-4 w-48" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading form">
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div
      className="min-h-screen grid lg:grid-cols-2 bg-background"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="hidden lg:block bg-muted p-10">
        <Skeleton className="h-10 w-40" />
        <div className="mt-24 space-y-4 max-w-md">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-4/5" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-14">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
          <AuthFormSkeleton />
        </div>
      </div>
    </div>
  );
}

export function AdminShellSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-zinc-950 flex"
      role="status"
      aria-busy="true"
      aria-label="Loading admin panel"
    >
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/80 p-6 flex flex-col gap-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-zinc-800" />
          <Skeleton className="h-6 w-32 bg-zinc-800" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg bg-zinc-800" />
          ))}
        </div>
        <div className="mt-auto space-y-3 border-t border-zinc-800 pt-4">
          <Skeleton className="h-4 w-40 bg-zinc-800" />
          <Skeleton className="h-9 w-full rounded-lg bg-zinc-800" />
        </div>
      </aside>
      <main className="flex-1 p-8">{children ?? <AdminOverviewSkeleton inline />}</main>
    </div>
  );
}

export function AdminOverviewSkeleton({ inline = false }: { inline?: boolean }) {
  const content = (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className={cn('h-8 w-36', inline && 'bg-zinc-800')} />
        <Skeleton className={cn('h-4 w-64', inline && 'bg-zinc-800')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-24 rounded-xl', inline && 'bg-zinc-800')}
          />
        ))}
      </div>
    </div>
  );

  if (inline) return content;

  return <AdminShellSkeleton>{content}</AdminShellSkeleton>;
}

export function AdminUsersContentSkeleton() {
  return (
    <div className="space-y-10" role="status" aria-busy="true" aria-label="Loading users">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24 bg-zinc-800" />
        <Skeleton className="h-4 w-56 bg-zinc-800" />
      </div>
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-6 w-48 bg-zinc-800" />
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full rounded-none bg-zinc-800/80"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminGroupsContentSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading groups">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28 bg-zinc-800" />
        <Skeleton className="h-4 w-52 bg-zinc-800" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export function AdminUsersSkeleton() {
  return (
    <AdminShellSkeleton>
      <AdminUsersContentSkeleton />
    </AdminShellSkeleton>
  );
}

export function AdminGroupsSkeleton() {
  return (
    <AdminShellSkeleton>
      <AdminGroupsContentSkeleton />
    </AdminShellSkeleton>
  );
}

export function AdminLoginSkeleton() {
  return (
    <div
      className="min-h-screen bg-zinc-950 flex items-center justify-center p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading admin sign in"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-6">
        <Skeleton className="h-3 w-24 bg-zinc-800" />
        <Skeleton className="h-8 w-40 bg-zinc-800" />
        <Skeleton className="h-4 w-full bg-zinc-800" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg bg-zinc-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-zinc-800" />
          <Skeleton className="h-11 w-full rounded-lg bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
