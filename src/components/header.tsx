
'use client';
import { NewHabitDialog } from './new-habit-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as React from 'react';
import { getJoinedGroups, type Habit } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';

interface HeaderProps {
    activeGroup: string;
    onActiveGroupChange: (groupId: string) => void;
    addHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'color'>) => void;
}

export function Header({ activeGroup, onActiveGroupChange, addHabit }: HeaderProps) {
  const { user } = useAuth();
  
  if (!user) {
     return (
       <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </header>
    );
  }

  const joinedGroups = getJoinedGroups(user.id);
  const activeGroupData = joinedGroups.find(g => g.id === activeGroup);

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, let's make today productive!</p>
        </div>
        {activeGroupData?.adminId === user.id && <NewHabitDialog addHabit={addHabit} />}
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
