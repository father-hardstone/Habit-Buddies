
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

  // Fallback Albert Einstein quotes when GenKit server is unavailable
  const einsteinQuotes = [
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "In the middle of difficulty lies opportunity.",
    "The only way to do great work is to love what you do.",
    "Imagination is more important than knowledge.",
    "Try not to become a person of success, but rather try to become a person of value.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It's not that I'm so smart, it's just that I stay with problems longer.",
    "Weakness of attitude becomes weakness of character.",
    "The important thing is not to stop questioning. Curiosity has its own reason for existence.",
    "A person who never made a mistake never tried anything new."
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
      // Find the habit with the longest streak across all joined groups
      const joinedGroups = getJoinedGroups(user.id);
      const allHabits = joinedGroups.flatMap(group => getHabitsForGroup(group.id));
      
      let topHabit = allHabits.length > 0 ? allHabits[0] : null;
      if (allHabits.length > 1) {
        topHabit = allHabits.reduce((prev, current) => (prev.streak > current.streak) ? prev : current);
      }
      
      // Try to get AI-generated encouragement
      try {
        const result = await generateEncouragement({
          habitName: topHabit?.name || 'making progress',
          userName: user.username,
          streakLength: topHabit?.streak || 1,
        });

        setMessage(result.encouragementMessage);
      } catch (aiError) {
        // If AI generation fails, fall back to Einstein quote
        console.warn('AI encouragement failed, using fallback quote:', aiError);
        const fallbackQuote = getRandomEinsteinQuote();
        setMessage(`"${fallbackQuote}" - Albert Einstein`);
      }
    } catch (error) {
      // Only show error toast for non-AI related errors
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
    <Card>
      <CardHeader>
        <CardTitle>Need a boost?</CardTitle>
        <CardDescription>Get a personalized message from our AI motivation coach.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {message && (
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>
                    {message.includes('Albert Einstein') ? 'Classic Wisdom' : 'Your motivational boost!'}
                </AlertTitle>
                <AlertDescription>
                    {message}
                </AlertDescription>
                {message.includes('Albert Einstein') && (
                    <p className="text-xs text-muted-foreground mt-2">
                        AI service temporarily unavailable - here's some timeless wisdom instead!
                    </p>
                )}
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
        <p className="text-xs text-muted-foreground text-center">
          {message.includes('Albert Einstein') ? 'Using fallback wisdom' : 'Powered by AI'}
        </p>
      </CardContent>
    </Card>
  );
}
