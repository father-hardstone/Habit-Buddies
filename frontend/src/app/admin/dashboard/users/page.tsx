'use client';

import * as React from 'react';
import { getRegisteredUsers, type RegisteredUser } from '@/lib/admin-api';
import { AdminUsersContentSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError } from '@/lib/error-utils';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getRegisteredUsers()
      .then(setUsers)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load users',
          context: 'admin.users',
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <AdminUsersContentSkeleton />;
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <p className="text-zinc-400 mt-1">All accounts stored in Supabase Postgres.</p>
      </div>

      <section className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 text-white">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{user.role ?? 'user'}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
