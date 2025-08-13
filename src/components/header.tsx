
'use client';
import { NewHabitDialog } from './new-habit-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as React from 'react';
import { getJoinedGroups, getCurrentUser, type Habit } from '@/lib/database';

const CURRENT_USER_ID = 1;

interface HeaderProps {
    activeGroup: string;
    onActiveGroupChange: (groupId: string) => void;
    addHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color'>) => void;
}

export function Header({ activeGroup, onActiveGroupChange, addHabit }: HeaderProps) {
  const user = getCurrentUser();
  const joinedGroups = getJoinedGroups(CURRENT_USER_ID);
  
  const activeGroupData = joinedGroups.find(g => g.id === activeGroup);

  if (!user || joinedGroups.length === 0) {
    // Handle loading or empty state
    return (
       <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome! It looks like you're not in any groups yet.</p>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, let's make today productive!</p>
        </div>
        {activeGroupData?.adminId === CURRENT_USER_ID && <NewHabitDialog addHabit={addHabit} />}
      </div>
      <div className="w-full overflow-x-auto">
        <Tabs value={activeGroup} onValueChange={onActiveGroupChange}>
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
