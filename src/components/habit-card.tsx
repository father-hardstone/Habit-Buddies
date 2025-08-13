'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Dumbbell, HeartPulse, GlassWater, Check, Flame } from 'lucide-react';
import { ProgressCircle } from './progress-circle';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export type Habit = {
  id: string;
  name: string;
  icon: keyof typeof icons;
  streak: number;
  goal: number; // e.g. 5 times a week
  completed: number; // how many times completed this week
  color: string;
};

const icons = {
  BookOpen,
  Dumbbell,
  HeartPulse,
  GlassWater
};

export function HabitCard({ habit }: { habit: Habit }) {
  const [completed, setCompleted] = React.useState(habit.completed);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const Icon = icons[habit.icon];
  const progress = (completed / habit.goal) * 100;
  const isGoalReached = completed >= habit.goal;

  const handleComplete = () => {
    if (completed < habit.goal) {
      const newCompleted = completed + 1;
      setCompleted(newCompleted);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <TooltipProvider>
      <Card
        className="relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
        style={{ '--habit-color': habit.color } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-transparent opacity-50 transition-opacity group-hover:opacity-100"></div>
        <CardContent className="relative flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4">
            <ProgressCircle value={progress} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="h-10 w-10 text-[--habit-color]" />
            </div>
          </div>
          <h3 className="font-headline text-xl font-semibold">{habit.name}</h3>
          <p className="text-sm text-muted-foreground">
            {completed}/{habit.goal} times this week
          </p>

          <div className="mt-6 flex w-full items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-warning">
                  <Flame className="h-5 w-5" />
                  <span>{habit.streak} day streak</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>You're on a {habit.streak}-day streak! Keep it up!</p>
              </TooltipContent>
            </Tooltip>
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={isGoalReached}
              className={cn(
                'rounded-full bg-[--habit-color] text-primary-foreground shadow-lg transition-all hover:bg-[--habit-color]/90 hover:scale-105 active:scale-95',
                isGoalReached && 'bg-success text-success-foreground hover:bg-success/90'
              )}
            >
              <Check className={cn('mr-2 h-4 w-4', { 'hidden': !isGoalReached })} />
              {isGoalReached ? 'Goal Met!' : 'Mark as Done'}
            </Button>
          </div>
        </CardContent>
        {isAnimating && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 animate-ping rounded-full bg-[--habit-color] opacity-50"></div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}
