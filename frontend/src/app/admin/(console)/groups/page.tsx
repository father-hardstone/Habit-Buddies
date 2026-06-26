'use client';

import * as React from 'react';
import { getAdminGroups, type AdminGroup } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminGroupsContentSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';

export default function AdminGroupsPage() {
  const [groups, setGroups] = React.useState<AdminGroup[]>([]);
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
        <h1 className="font-headline text-3xl font-bold tracking-tight">Groups</h1>
        <p className="mt-1 text-muted-foreground">All groups on the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription className="line-clamp-2">{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 text-sm text-muted-foreground">
              <span>{group.memberCount} members</span>
              <span>{group.habitCount ?? 0} habits</span>
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="py-10 text-center text-muted-foreground">
              No groups yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
