'use client';

import * as React from 'react';
import { getRegisteredUsers, type RegisteredUser } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">All accounts stored in Supabase Postgres.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered users</CardTitle>
          <CardDescription>{users.length} total accounts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.role ?? 'user'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No users yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
