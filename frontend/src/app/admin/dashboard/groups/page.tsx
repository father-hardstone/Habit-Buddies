'use client';

import * as React from 'react';
import { getAdminGroups } from '@/lib/admin-api';
import { AdminGroupsContentSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';

export default function AdminGroupsPage() {
  const [groups, setGroups] = React.useState<
    { id: string; name: string; description: string; memberCount: number; habits: unknown[] }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getAdminGroups()
      .then(setGroups)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load groups',
          context: 'admin.groups',
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <AdminGroupsContentSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Groups</h2>
        <p className="text-zinc-400 mt-1">Groups from the JSON database.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2"
          >
            <h3 className="text-lg font-semibold text-white">{group.name}</h3>
            <p className="text-sm text-zinc-400 line-clamp-2">{group.description}</p>
            <div className="flex gap-4 text-xs text-zinc-500 pt-2">
              <span>{group.memberCount} members</span>
              <span>{group.habits.length} habits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
