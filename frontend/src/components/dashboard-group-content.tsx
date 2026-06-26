'use client';

import * as React from 'react';
import { HabitList } from '@/components/habit-list';
import { GroupRanking } from '@/components/group-ranking';
import { PersonalizedMotivation } from '@/components/personalized-motivation';
import { HabitAnalytics } from '@/components/habit-analytics';
import { DashboardContentSkeleton } from '@/components/ui/skeleton-loaders';
import { getHabitsForGroup, type Habit } from '@/lib/database';
import { handleAsyncError } from '@/lib/error-utils';

type DashboardGroupContentProps = {
  groupId: string;
  userId: string;
  habits: Habit[];
  onHabitsChange: React.Dispatch<React.SetStateAction<Habit[]>>;
};

export function DashboardGroupContent({
  groupId,
  userId,
  habits,
  onHabitsChange,
}: DashboardGroupContentProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = React.useState(0);
  const [rankingRefreshKey, setRankingRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!groupId) {
      onHabitsChange([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getHabitsForGroup(groupId)
      .then((nextHabits) => {
        if (!cancelled) {
          onHabitsChange(nextHabits);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleAsyncError(error, {
            title: 'Could not load habits',
            context: 'dashboard.habits',
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, onHabitsChange]);

  const handleHabitUpdated = React.useCallback(
    (updated: Habit) => {
      onHabitsChange((current) =>
        current.map((habit) => (habit.id === updated.id ? updated : habit)),
      );
      setAnalyticsRefreshKey((value) => value + 1);
      setRankingRefreshKey((value) => value + 1);
    },
    [onHabitsChange],
  );

  if (isLoading) {
    return <DashboardContentSkeleton />;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4 scrollbar-thin md:p-5 lg:overflow-hidden lg:p-6">
      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:gap-5 lg:overflow-hidden">
        <div className="flex flex-col gap-4 lg:col-span-2 lg:min-h-0 lg:overflow-hidden">
          <HabitList
            groupId={groupId}
            habits={habits}
            onHabitUpdated={handleHabitUpdated}
            className="lg:h-full lg:min-h-0"
          />
          <div className="shrink-0 lg:h-[min(45vh,22rem)] lg:min-h-[12rem]">
            <HabitAnalytics
              groupId={groupId}
              refreshKey={analyticsRefreshKey}
              className="min-h-[22rem] w-full lg:h-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-1 lg:min-h-0 lg:overflow-hidden">
          <GroupRanking
            groupId={groupId}
            currentUserId={userId}
            refreshKey={rankingRefreshKey}
            className="lg:min-h-0 lg:flex-1"
          />
          <PersonalizedMotivation
            habits={habits}
            className="shrink-0 rounded-lg border shadow-sm"
          />
        </div>
      </div>
    </main>
  );
}
