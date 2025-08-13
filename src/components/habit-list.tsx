'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitCard, type Habit } from '@/components/habit-card';

const habits: Habit[] = [
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

export function HabitList() {
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
