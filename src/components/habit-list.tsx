'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitCard } from '@/components/habit-card';
import type { Habit } from '@/lib/database';

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">My Habits</CardTitle>
        <CardDescription>Your daily and weekly progress at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
         {habits.length === 0 && (
            <div className="col-span-1 sm:col-span-2 text-center p-12 bg-card rounded-lg border border-dashed">
                <p className="text-muted-foreground">This group has no habits yet.</p>
                <p className="text-sm text-muted-foreground">Admins can add new habits for the group.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
