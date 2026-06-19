
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateEncouragement } from '@/ai/flows/personalized-encouragement';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Habit } from '@/lib/database';
import { cn } from '@/lib/utils';

interface PersonalizedMotivationProps {
  habits: Habit[];
  className?: string;
}

export function PersonalizedMotivation({ habits, className }: PersonalizedMotivationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const einsteinQuotes = [
    'Life is like riding a bicycle. To keep your balance, you must keep moving.',
    'In the middle of difficulty lies opportunity.',
    'The only way to do great work is to love what you do.',
    'Imagination is more important than knowledge.',
    'Try not to become a person of success, but rather try to become a person of value.',
  ];

  const getRandomEinsteinQuote = () => {
    const randomIndex = Math.floor(Math.random() * einsteinQuotes.length);
    return einsteinQuotes[randomIndex];
  };

  const handleGenerate = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage('');

    try {
      let topHabit = habits.length > 0 ? habits[0] : null;
      if (habits.length > 1) {
        topHabit = habits.reduce((prev, current) =>
          prev.streak > current.streak ? prev : current,
        );
      }

      try {
        const result = await generateEncouragement({
          habitName: topHabit?.name || 'making progress',
          userName: user.username,
          streakLength: topHabit?.streak || 1,
        });

        setMessage(result.encouragementMessage);
      } catch (aiError) {
        console.warn('AI encouragement failed, using fallback quote:', aiError);
        setMessage(`"${getRandomEinsteinQuote()}" — Albert Einstein`);
      }
    } catch (error) {
      console.error('Non-AI error in motivation component:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not generate encouragement. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'shrink-0 bg-card px-3 py-3 md:px-4',
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Need a boost?</p>
          {message ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{message}</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Get a quick motivational message from our AI coach.
            </p>
          )}
        </div>
        <Button
          onClick={() => void handleGenerate()}
          disabled={isLoading}
          size="sm"
          className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          {isLoading ? 'Generating...' : 'Get a boost!'}
        </Button>
      </div>
    </div>
  );
}
