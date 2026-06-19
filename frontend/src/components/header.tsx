
'use client';
import { GroupInviteTrigger } from './group-invite-dialog';
import { NewHabitDialog } from './new-habit-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Group, Habit } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { SidebarTrigger } from './ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface HeaderProps {
    joinedGroups: Group[];
    activeGroup: string;
    onActiveGroupChange: (groupId: string) => void;
    addHabit: (
      newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color' | 'weeklyPoints' | 'canLog' | 'pointsPerLog'>,
    ) => Promise<void>;
}

export function Header({ joinedGroups, activeGroup, onActiveGroupChange, addHabit }: HeaderProps) {
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
  const tabCount = joinedGroups.length;

  return (
    <header className="z-30 flex shrink-0 flex-col gap-3 border-b bg-background/95 px-4 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
           <SidebarTrigger className="md:hidden" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold font-headline md:text-3xl">Dashboard</h1>
            <p className="truncate text-sm text-muted-foreground md:text-base">
              Welcome back, {user.username}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
      {tabCount > 0 && (
        <Tabs value={activeGroup} onValueChange={onActiveGroupChange} className="w-full">
          <TabsList
            className="grid h-auto w-full gap-1 rounded-lg bg-muted/50 p-1"
            style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}
          >
            {joinedGroups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                title={group.name}
                className={cn(
                  'min-w-0 truncate rounded-md px-2 py-2 font-medium transition-all',
                  tabCount > 6 && 'px-1.5 py-1.5 text-[11px]',
                  tabCount > 4 && tabCount <= 6 && 'text-xs',
                  tabCount <= 4 && 'text-sm',
                )}
              >
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
    </header>
  );
}
