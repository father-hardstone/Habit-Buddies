
'use client';
import * as React from 'react';
import { Header } from '@/components/header';
import { HabitList } from '@/components/habit-list';
import { GroupRanking } from '@/components/group-ranking';
import { PersonalizedMotivation } from '@/components/personalized-motivation';
import { getJoinedGroups, getHabitsForGroup, type Habit, updateGroupHabits } from '@/lib/database';
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
            id: `${activeGroup}-${(habits.length + 1)}-${new Date().getTime()}`, // more unique ID
            streak: 0,
            completed: 0,
            color: habitColors[habits.length % habitColors.length],
        };

        // In a real app, you'd send this to a server to be saved.
        // For this prototype, we'll log it and I can use it to update the JSON file.
        console.log('--- NEW HABIT DATA ---');
        console.log('Group ID to update:', activeGroup);
        console.log('Habit to add:', JSON.stringify(habitToAdd, null, 2));
        console.log('----------------------');

        const newHabits = [...habits, habitToAdd];
        setHabits(newHabits);
        // This function updates the data in memory for this session
        updateGroupHabits(activeGroup, newHabits);
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
