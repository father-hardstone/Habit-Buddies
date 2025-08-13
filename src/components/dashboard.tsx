
'use client';
import * as React from 'react';
import { Header } from '@/components/header';
import { HabitList } from '@/components/habit-list';
import { GroupRanking } from '@/components/group-ranking';
import { PersonalizedMotivation } from '@/components/personalized-motivation';
import { getJoinedGroups, getCurrentUser, type Habit } from '@/lib/database';

const CURRENT_USER_ID = 1;

const habitColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function Dashboard() {
  const user = getCurrentUser();
  const joinedGroups = getJoinedGroups(CURRENT_USER_ID);
  const [activeGroup, setActiveGroup] = React.useState(joinedGroups[0]?.id || '');
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    if(activeGroup) {
      const groupHabits = require(`@/data/groups.json`).find((g: any) => g.id === activeGroup)?.habits || [];
      setHabits(groupHabits);
    }
  }, [activeGroup]);


  if (!user || joinedGroups.length === 0) {
     return (
       <div className="flex flex-col min-h-screen">
         <Header activeGroup="" onActiveGroupChange={() => {}} addHabit={() => {}} />
         <main className="flex-1 p-4 md:p-6 lg:p-8 text-center">
            <p className="text-lg">You haven't joined any groups yet.</p>
            <p className="text-muted-foreground">Go to the Groups page to find a community!</p>
         </main>
       </div>
     );
  }

  const addHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color'>) => {
        const habitToAdd: Habit = {
            ...newHabit,
            id: (habits.length + 1).toString(),
            streak: 0,
            completed: 0,
            color: habitColors[habits.length % habitColors.length],
        };
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
          <GroupRanking groupId={activeGroup} />
          <PersonalizedMotivation />
        </div>
      </main>
    </div>
  );
}
