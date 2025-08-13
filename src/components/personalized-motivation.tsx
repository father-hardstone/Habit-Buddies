
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateEncouragement } from '@/ai/flows/personalized-encouragement';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { getHabitsForGroup, getJoinedGroups } from '@/lib/database';

export function PersonalizedMotivation() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Find the habit with the longest streak across all joined groups
      const joinedGroups = getJoinedGroups(user.id);
      const allHabits = joinedGroups.flatMap(group => getHabitsForGroup(group.id));
      
      let topHabit = allHabits.length > 0 ? allHabits[0] : null;
      if (allHabits.length > 1) {
        topHabit = allHabits.reduce((prev, current) => (prev.streak > current.streak) ? prev : current);
      }
      
      const result = await generateEncouragement({
        habitName: topHabit?.name || 'making progress',
        userName: user.name,
        streakLength: topHabit?.streak || 1,
      });

      setMessage(result.encouragementMessage);
    } catch (error) {
      console.error(error);
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
    <Card>
      <CardHeader>
        <CardTitle>Need a boost?</CardTitle>
        <CardDescription>Get a personalized message from our AI motivation coach.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {message && (
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Your motivational boost!</AlertTitle>
                <AlertDescription>
                    {message}
                </AlertDescription>
            </Alert>
        )}
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating...' : 'Get a boost!'}
        </Button>
      </CardContent>
    </Card>
  );
}
