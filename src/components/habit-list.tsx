'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitCard, type Habit } from '@/components/habit-card';
import { NewHabitDialog } from './new-habit-dialog';

const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Read for 15 minutes',
    icon: 'BookOpen',
    streak: 12,
    goal: 7,
    completed: 5,
    color: 'hsl(var(--chart-1))',
  },
  {
    id: '2',
    name: 'Morning workout',
    icon: 'Dumbbell',
    streak: 5,
    goal: 5,
    completed: 5,
    color: 'hsl(var(--chart-2))',
  },
  {
    id: '3',
    name: 'Meditate for 10 minutes',
    icon: 'HeartPulse',
    streak: 28,
    goal: 7,
    completed: 7,
    color: 'hsl(var(--chart-3))',
  },
    {
    id: '4',
    name: 'Drink 8 glasses of water',
    icon: 'GlassWater',
    streak: 2,
    goal: 7,
    completed: 3,
    color: 'hsl(var(--chart-4))',
  },
];

const habitColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function HabitList() {
    const [habits, setHabits] = useState<Habit[]>(initialHabits);

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
      </CardContent>
    </Card>
  );
}
