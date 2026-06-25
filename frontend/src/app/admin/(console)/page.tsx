'use client';

import * as React from 'react';
import { getAdminStats, type AdminStats } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminOverviewSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-headline text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load stats',
          context: 'admin.stats',
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <AdminOverviewSkeleton inline />;
  }

  if (!stats) {
    return <p className="text-destructive">Failed to load stats.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-muted-foreground">Platform snapshot from the shared backend.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered users" value={stats.registeredUsers} />
        <StatCard label="Groups" value={stats.groups} />
        <StatCard label="Chats" value={stats.chats} />
        <StatCard label="Total habits" value={stats.totalHabits} />
      </div>
    </div>
  );
}
