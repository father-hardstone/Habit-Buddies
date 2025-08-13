
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitCard } from '@/components/habit-card';
import { NewHabitDialog } from './new-habit-dialog';
import type { Habit } from '@/lib/database';
import { getHabitsForGroup } from '@/lib/database';

interface HabitListProps {
  groupId: string;
}

const habitColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function HabitList({ groupId }: HabitListProps) {
    const [habits, setHabits] = useState<Habit[]>([]);

    useEffect(() => {
      const groupHabits = getHabitsForGroup(groupId);
      setHabits(groupHabits);
    }, [groupId]);

    const addHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color'>) => {
        const habitToAdd: Habit = {
            ...newHabit,
            id: (habits.length + 1).toString(),
            streak: 0,
            completed: 0,
            color: habitColors[habits.length % habitColors.length],
        };
        setHabits([...habits, habitToAdd]);
    };

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
