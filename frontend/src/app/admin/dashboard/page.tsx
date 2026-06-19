'use client';

import * as React from 'react';
import { getAdminStats, type AdminStats } from '@/lib/admin-api';
import { AdminOverviewSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
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
    return <p className="text-red-400">Failed to load stats.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-zinc-400 mt-1">Platform snapshot from the shared backend.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Registered users" value={stats.registeredUsers} />
        <StatCard label="Groups" value={stats.groups} />
        <StatCard label="Chats" value={stats.chats} />
        <StatCard label="Total habits" value={stats.totalHabits} />
      </div>
    </div>
  );
}
