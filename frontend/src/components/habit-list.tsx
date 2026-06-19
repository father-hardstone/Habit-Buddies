'use client';
import React from 'react';
import { HabitCard } from '@/components/habit-card';
import type { Habit } from '@/lib/database';
import { cn } from '@/lib/utils';

interface HabitListProps {
  groupId: string;
  habits: Habit[];
  onHabitUpdated: (habit: Habit) => void;
  className?: string;
}

export function HabitList({ groupId, habits, onHabitUpdated, className }: HabitListProps) {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 flex-col rounded-lg border border-border/70 bg-card/40 shadow-sm',
        className,
      )}
    >
      <div className="shrink-0 border-b border-border/50 px-4 py-3">
        <h2 className="text-lg font-semibold font-headline tracking-tight">My Habits</h2>
        <p className="text-sm text-muted-foreground">Track weekly progress and daily streaks.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 scrollbar-thin md:p-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              groupId={groupId}
              onHabitUpdated={onHabitUpdated}
            />
          ))}
          {habits.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">This group has no habits yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Group admins can add habits for everyone to track.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
