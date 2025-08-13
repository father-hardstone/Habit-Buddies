
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Habit } from '@/lib/database';
import { subDays, format } from 'date-fns';

const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    return { date: format(date, 'EEE'), completed: 0 };
}).reverse();


interface HabitAnalyticsProps {
  habits: Habit[];
}

export function HabitAnalytics({ habits }: HabitAnalyticsProps) {
    
    // In a real app, this data would come from a database.
    // For this prototype, we'll simulate it based on current habit state.
    const weeklyData = React.useMemo(() => {
        const data = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), i);
            return { date: format(date, 'EEE'), completed: 0 };
        }).reverse();

        habits.forEach(habit => {
            // Distribute completed days randomly for visual effect in prototype
            for (let i = 0; i < habit.completed; i++) {
                const randomDayIndex = Math.floor(Math.random() * 7);
                data[randomDayIndex].completed += 1;
            }
        });

        return data;
    }, [habits]);


    const chartConfig = {
        completed: {
            label: 'Habits Completed',
            color: 'hsl(var(--primary))',
        },
    } satisfies ChartConfig;


    if (habits.length === 0) {
        return null; // Don't show analytics if there are no habits
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Report</CardTitle>
        <CardDescription>Your habit completion for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={weeklyData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => value.slice(0, 3)}
            />
             <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
