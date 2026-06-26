
'use client';
import { GroupInviteTrigger } from './group-invite-dialog';
import { NewHabitDialog } from './new-habit-dialog';
import type { Group, Habit } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { SidebarTrigger } from './ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupTabsBar } from '@/components/dashboard/group-tabs-bar';

interface HeaderProps {
    joinedGroups: Group[];
    activeGroup: string;
    onActiveGroupChange: (groupId: string) => void;
    onGroupOrderChange: (fromIndex: number, toIndex: number) => void;
    addHabit: (
      newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color' | 'weeklyPoints' | 'canLog' | 'pointsPerLog'>,
    ) => Promise<void>;
}

export function Header({
  joinedGroups,
  activeGroup,
  onActiveGroupChange,
  onGroupOrderChange,
  addHabit,
}: HeaderProps) {
  const { user } = useAuth();
  
  if (!user) {
     return (
       <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </header>
    );
  }

  const activeGroupData = joinedGroups.find(g => g.id === activeGroup);

  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-3 border-b bg-background/95 px-4 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:px-6 md:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
           <SidebarTrigger className="shrink-0 md:hidden" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold font-headline md:text-3xl">Dashboard</h1>
            <p className="truncate text-sm text-muted-foreground md:text-base">
              Welcome back, {user.username}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {activeGroupData?.adminId === user.id && (
            <>
              <GroupInviteTrigger
                groupId={activeGroupData.id}
                groupName={activeGroupData.name}
                isPublic={activeGroupData.isPublic}
                variant="button"
              />
              <NewHabitDialog addHabit={addHabit} />
            </>
          )}
        </div>
      </div>
      {joinedGroups.length > 0 && (
        <GroupTabsBar
          groups={joinedGroups}
          activeGroupId={activeGroup}
          onActiveGroupChange={onActiveGroupChange}
          onReorder={onGroupOrderChange}
        />
      )}
    </header>
  );
}
