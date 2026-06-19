'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Dumbbell, HeartPulse, GlassWater, Check, Flame, Loader2 } from 'lucide-react';
import { ProgressCircle } from './progress-circle';
import { cn } from '@/lib/utils';
import { completeHabit } from '@/lib/database';
import type { Habit } from '@/lib/database';
import { handleAsyncError } from '@/lib/error-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type HabitCardHabit = Habit;

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Dumbbell,
  HeartPulse,
  GlassWater,
};

type HabitCardProps = {
  habit: HabitCardHabit;
  groupId: string;
  onHabitUpdated: (habit: Habit) => void;
};

export function HabitCard({ habit, groupId, onHabitUpdated }: HabitCardProps) {
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const Icon = icons[habit.icon ?? 'BookOpen'] ?? BookOpen;
  const progress = (habit.completed / habit.goal) * 100;
  const isGoalReached = habit.completed >= habit.goal;
  const canLog = habit.canLog !== false && !isGoalReached;

  React.useEffect(() => {
    setIsAnimating(false);
  }, [habit.completed, habit.streak]);

  const handleComplete = async () => {
    if (!canLog || isCompleting) return;

    setIsCompleting(true);
    try {
      const updated = await completeHabit(groupId, habit.id);
      onHabitUpdated(updated);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not log habit',
        context: 'habitCard.complete',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <TooltipProvider>
      <Card
        className="group relative overflow-hidden border-border/60 bg-card/80 shadow-sm transition-shadow hover:shadow-md"
        style={{ '--habit-color': habit.color } as React.CSSProperties}
      >
        <CardContent className="relative flex items-center gap-3 p-3 sm:p-3.5">
          <div className="relative shrink-0">
            <ProgressCircle value={progress} size={56} strokeWidth={7} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="h-5 w-5 text-[--habit-color]" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-headline text-sm font-semibold sm:text-base">
              {habit.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {habit.completed}/{habit.goal} this week
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-foreground">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span>{habit.streak}</span>
                  <span className="font-normal text-muted-foreground">day streak</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{habit.streak}-day streak — keep it going!</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            size="sm"
            onClick={() => void handleComplete()}
            disabled={!canLog || isCompleting}
            className={cn(
              'h-8 shrink-0 rounded-full px-3 text-xs',
              'bg-[--habit-color] text-primary-foreground shadow-sm hover:bg-[--habit-color]/90',
              isGoalReached && 'bg-success text-success-foreground hover:bg-success/90',
            )}
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className={cn('mr-1 h-3.5 w-3.5', { hidden: !isGoalReached })} />
                {isGoalReached ? 'Done' : 'Log'}
              </>
            )}
          </Button>
        </CardContent>

        {isAnimating && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 animate-ping rounded-full bg-[--habit-color] opacity-30" />
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}
