
'use client';
import * as React from 'react';
import { Header } from '@/components/header';
import { HabitList } from '@/components/habit-list';
import { GroupRanking } from '@/components/group-ranking';
import { PersonalizedMotivation } from '@/components/personalized-motivation';
import { getJoinedGroups, getHabitsForGroup, type Habit } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';

const habitColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function Dashboard() {
  const { user } = useAuth();
  const joinedGroups = getJoinedGroups(user!.id); // User is guaranteed by ProtectedRoute
  const [activeGroup, setActiveGroup] = React.useState(joinedGroups[0]?.id || '');
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    if(activeGroup) {
      // In a real app, this would be an API call.
      // For now, we simulate saving by re-reading from our "database"
      const groupHabits = getHabitsForGroup(activeGroup)
      setHabits(groupHabits);
    }
  }, [activeGroup]);


  if (!user || joinedGroups.length === 0) {
     return (
       <div className="flex flex-col min-h-screen">
         <Header activeGroup="" onActiveGroupChange={() => {}} addHabit={() => {}} />
         <main className="flex-1 p-8 text-center flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">Welcome to Habit Buddies!</p>
            <p className="text-lg text-muted-foreground mt-2">You haven't joined any groups yet.</p>
            <p className="text-muted-foreground">Go to the Groups page to find a community!</p>
            <Button asChild className="mt-4">
                <Link href="/groups">Find Groups</Link>
            </Button>
         </main>
       </div>
     );
  }

  const addHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color'>) => {
        const habitToAdd: Habit = {
            ...newHabit,
            id: (habits.length + 1).toString(), // simplified ID generation
            streak: 0,
            completed: 0,
            color: habitColors[habits.length % habitColors.length],
        };
        // NOTE: This only updates local state.
        // To persist, we'd need to update the JSON file, which is outside the scope of this simulation.
        // In a real app, this would be an API call.
        setHabits([...habits, habitToAdd]);
    };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeGroup={activeGroup} onActiveGroupChange={setActiveGroup} addHabit={addHabit} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HabitList habits={habits} />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <GroupRanking groupId={activeGroup} currentUserId={user.id} />
          <PersonalizedMotivation />
        </div>
      </main>
    </div>
  );
}
