
'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitCard } from '@/components/habit-card';
import type { Habit } from '@/lib/database';

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Habits</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
         {habits.length === 0 && (
            <p className="text-muted-foreground col-span-2 text-center p-8">This group has no habits yet. Admins can add them!</p>
        )}
      </CardContent>
    </Card>
  );
}
