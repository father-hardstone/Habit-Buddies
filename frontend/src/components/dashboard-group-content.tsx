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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-5 xl:p-6">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-3 xl:gap-5">
        <div className="flex min-h-0 flex-col overflow-hidden xl:col-span-2">
          <div className="min-h-0 flex-1 overflow-hidden">
            <HabitList
              groupId={groupId}
              habits={habits}
              onHabitUpdated={handleHabitUpdated}
              className="h-full"
            />
          </div>
          <div className="mt-3 h-[min(45vh,22rem)] min-h-[12rem] shrink-0">
            <HabitAnalytics
              groupId={groupId}
              refreshKey={analyticsRefreshKey}
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden xl:col-span-1">
          <GroupRanking
            groupId={groupId}
            currentUserId={userId}
            refreshKey={rankingRefreshKey}
            className="min-h-0 flex-1"
          />
          <PersonalizedMotivation
            habits={habits}
            className="mt-3 shrink-0 rounded-lg border shadow-sm"
          />
        </div>
      </div>
    </main>
  );
}
