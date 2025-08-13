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
        className="relative overflow-hidden transition-all hover:shadow-lg"
        style={{ '--habit-color': habit.color } as React.CSSProperties}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4">
            <ProgressCircle value={progress} style={{ color: habit.color }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="h-10 w-10 text-[--habit-color]" />
            </div>
          </div>
          <h3 className="font-headline text-lg font-semibold">{habit.name}</h3>
          <p className="text-sm text-muted-foreground">
            Completed {completed}/{habit.goal} times this week
          </p>

          <div className="mt-4 flex w-full items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-warning">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{habit.streak}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{habit.streak}-day streak!</p>
              </TooltipContent>
            </Tooltip>
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={isGoalReached}
              className={cn(
                'bg-[--habit-color] text-primary-foreground hover:bg-[--habit-color]/90',
                isGoalReached && 'bg-success text-success-foreground hover:bg-success/90'
              )}
            >
              <Check className={cn('mr-2 h-4 w-4', { 'hidden': !isGoalReached })} />
              {isGoalReached ? 'Done!' : 'Complete'}
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
