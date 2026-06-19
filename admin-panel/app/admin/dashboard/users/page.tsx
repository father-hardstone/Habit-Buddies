'use client';

import * as React from 'react';
import { getDemoUsers, getRegisteredUsers, type RegisteredUser } from '@/lib/admin-api';

export default function AdminUsersPage() {
  const [registered, setRegistered] = React.useState<RegisteredUser[]>([]);
  const [demoUsers, setDemoUsers] = React.useState<
    { id: number; name: string; email: string; groups: unknown[] }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([getRegisteredUsers(), getDemoUsers()])
      .then(([reg, demo]) => {
        setRegistered(reg);
        setDemoUsers(demo);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-zinc-400">Loading users...</div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <p className="text-zinc-400 mt-1">Registered accounts and demo seed users.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Registered users (SQLite)</h3>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {registered.map((user) => (
                <tr key={user.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 text-white">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {registered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                    No registered users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Demo users (JSON database)</h3>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Groups</th>
              </tr>
            </thead>
            <tbody>
              {demoUsers.map((user) => (
                <tr key={user.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 text-white">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{user.groups.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
