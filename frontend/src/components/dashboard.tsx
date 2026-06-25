
'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { DashboardGroupContent } from '@/components/dashboard-group-content';
import {
  getJoinedGroups,
  type Group,
  type Habit,
  updateGroupHabits,
} from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import Link from 'next/link';
import { DashboardSkeleton } from './ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';
import { useGroupTabOrder } from '@/hooks/use-group-tab-order';

const habitColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

const dashboardShellClass =
  'flex min-h-0 flex-col xl:h-full xl:max-h-full xl:overflow-hidden';

export function Dashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [joinedGroups, setJoinedGroups] = React.useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = React.useState('');
  const [habitsByGroup, setHabitsByGroup] = React.useState<Record<string, Habit[]>>({});
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const { orderedGroups, reorderGroups } = useGroupTabOrder(user?.id, joinedGroups);

  const setHabitsForActiveGroup = React.useCallback(
    (value: React.SetStateAction<Habit[]>) => {
      if (!activeGroup) return;
      setHabitsByGroup((current) => {
        const previous = current[activeGroup] ?? [];
        const next = typeof value === 'function' ? value(previous) : value;
        return { ...current, [activeGroup]: next };
      });
    },
    [activeGroup],
  );

  React.useEffect(() => {
    if (!user) return;

    setIsPageLoading(true);
    getJoinedGroups()
      .then((groups) => {
        setJoinedGroups(groups);
        setActiveGroup((current) => current || groups[0]?.id || '');
      })
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load groups',
          context: 'dashboard.groups',
        });
      })
      .finally(() => setIsPageLoading(false));
  }, [user]);

  React.useEffect(() => {
    const groupId = searchParams.get('group');
    if (!groupId || joinedGroups.length === 0) return;
    if (joinedGroups.some((group) => group.id === groupId)) {
      setActiveGroup(groupId);
    }
  }, [searchParams, joinedGroups]);

  const handleGroupChange = (groupId: string) => {
    if (groupId !== activeGroup) {
      setActiveGroup(groupId);
    }
  };

  if (isPageLoading) {
    return <DashboardSkeleton />;
  }

  if (!user || joinedGroups.length === 0) {
     return (
       <div className={dashboardShellClass}>
         <Header
           joinedGroups={[]}
           activeGroup=""
           onActiveGroupChange={() => {}}
           onGroupOrderChange={() => {}}
           addHabit={async () => {}}
         />
         <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-2xl font-bold">Welcome to Habit Buddies!</p>
            <p className="mt-2 text-lg text-muted-foreground">
              You haven&apos;t joined any groups yet.
            </p>
            <p className="text-muted-foreground">Go to the Groups page to find a community!</p>
            <Button asChild className="mt-4">
                <Link href="/groups" prefetch>Find Groups</Link>
            </Button>
         </main>
       </div>
     );
  }

  const activeHabits = habitsByGroup[activeGroup] ?? [];

  const addHabit = async (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color' | 'weeklyPoints' | 'canLog' | 'pointsPerLog'>) => {
        try {
          const savedHabits = await updateGroupHabits(activeGroup, [
            ...activeHabits,
            {
              ...newHabit,
              streak: 0,
              completed: 0,
              color: habitColors[activeHabits.length % habitColors.length],
            },
          ]);
          setHabitsByGroup((current) => ({
            ...current,
            [activeGroup]: savedHabits,
          }));
        } catch (error) {
          handleAsyncError(error, {
            title: 'Could not add habit',
            context: 'dashboard.addHabit',
          });
          throw error;
        }
    };

  return (
    <div className={dashboardShellClass}>
      <Header
        joinedGroups={orderedGroups}
        activeGroup={activeGroup}
        onActiveGroupChange={handleGroupChange}
        onGroupOrderChange={reorderGroups}
        addHabit={addHabit}
      />
      <DashboardGroupContent
        groupId={activeGroup}
        userId={user.id}
        habits={activeHabits}
        onHabitsChange={setHabitsForActiveGroup}
      />
    </div>
  );
}
