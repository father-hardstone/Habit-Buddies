
'use client';
import * as React from 'react';
import { Header } from '@/components/header';
import { HabitList } from '@/components/habit-list';
import { GroupRanking } from '@/components/group-ranking';
import { PersonalizedMotivation } from '@/components/personalized-motivation';
import { getJoinedGroups, getCurrentUser } from '@/lib/database';

const CURRENT_USER_ID = 1;

export function Dashboard() {
  const user = getCurrentUser();
  const joinedGroups = getJoinedGroups(CURRENT_USER_ID);
  const [activeGroup, setActiveGroup] = React.useState(joinedGroups[0]?.id || '');

  if (!user || joinedGroups.length === 0) {
     return (
       <div className="flex flex-col min-h-screen">
         <Header activeGroup="" onActiveGroupChange={() => {}} />
         <main className="flex-1 p-4 md:p-6 lg:p-8 text-center">
            <p className="text-lg">You haven't joined any groups yet.</p>
            <p className="text-muted-foreground">Go to the Groups page to find a community!</p>
         </main>
       </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeGroup={activeGroup} onActiveGroupChange={setActiveGroup} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HabitList groupId={activeGroup} />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <GroupRanking groupId={activeGroup} />
          <PersonalizedMotivation />
        </div>
      </main>
    </div>
  );
}
