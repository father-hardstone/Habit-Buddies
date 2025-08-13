'use client';
import { NewHabitDialog } from './new-habit-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as React from 'react';

const joinedGroups = [
  { id: '1', name: 'Procrasti-haters', isAdmin: true },
  { id: '4', name: 'Mindful Moments', isAdmin: false },
  { id: '6', name: 'Hydration Nation', isAdmin: false },
  { id: '7', name: 'Bookworms', isAdmin: false },
  { id: '8', name: 'Early Birds', isAdmin: false },
  { id: '9', name: 'Fitness Fans', isAdmin: false },
];

export function Header() {
  const [activeGroup, setActiveGroup] = React.useState(joinedGroups[0].id);
  const activeGroupData = joinedGroups.find(g => g.id === activeGroup);

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, let's make today productive!</p>
        </div>
        {activeGroupData?.isAdmin && <NewHabitDialog />}
      </div>
      <div className="w-full overflow-x-auto">
        <Tabs value={activeGroup} onValueChange={setActiveGroup}>
          <TabsList>
            {joinedGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
