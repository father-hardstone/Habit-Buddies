
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Check, Globe, Loader2, Lock, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllGroups, joinGroup, type Group } from '@/lib/database';
import { AppPageHeader } from '@/components/app-page-header';
import { AppPageShell } from '@/components/app-page-shell';
import { CreateGroupDialog } from '@/components/create-group-dialog';
import { GroupsPageSkeleton } from '@/components/ui/skeleton-loaders';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';
import * as React from 'react';

function getGroupImageUrl(group: Group) {
  if (group.image && group.image.startsWith('http')) {
    return group.image;
  }

  return `https://placehold.co/600x400/9333ea/ffffff?text=${encodeURIComponent(group.name.slice(0, 18))}`;
}

export default function GroupsPage() {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);

  const loadGroups = React.useCallback(() => {
    return getAllGroups()
      .then(setGroups)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load groups',
          context: 'groups.page',
        });
      });
  }, []);

  React.useEffect(() => {
    loadGroups().finally(() => setIsLoading(false));
  }, [loadGroups]);

  const filteredGroups = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;

    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.creatorName.toLowerCase().includes(query) ||
        group.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [groups, search]);

  const handleJoin = async (groupId: string) => {
    setJoiningId(groupId);
    try {
      const updated = await joinGroup(groupId);
      setGroups((current) =>
        current.map((group) => (group.id === groupId ? updated : group)),
      );
      showSuccessToast('Joined group', `You are now a member of ${updated.name}.`);
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not join group',
        context: 'groups.join',
      });
    } finally {
      setJoiningId(null);
    }
  };

  const handleGroupCreated = (group: Group) => {
    setGroups((current) => [group, ...current].sort((a, b) => a.name.localeCompare(b.name)));
  };

  if (isLoading) {
    return <GroupsPageSkeleton />;
  }

  return (
    <AppPageShell>
      <AppPageHeader
        title="Discover Groups"
        description="Find a community to share your journey with."
      >
        <div className="relative w-full min-w-0 flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            className="w-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CreateGroupDialog onCreated={handleGroupCreated} />
      </AppPageHeader>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 scrollbar-thin md:p-6 lg:p-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="flex flex-col overflow-hidden shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <Image
                src={getGroupImageUrl(group)}
                alt={group.name}
                width={600}
                height={400}
                className="h-48 w-full object-cover"
                data-ai-hint={group.aiHint}
              />
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Created by {group.creatorName}
                  </p>
                  {group.isPublic ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Globe className="size-3" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="size-3" />
                      Private
                    </span>
                  )}
                </div>
                <CardTitle className="mt-1">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">{tag}</span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group.members} members</span>
                </div>
                <Button
                  variant={group.isJoined ? 'secondary' : 'outline'}
                  disabled={group.isJoined || joiningId === group.id}
                  onClick={() => void handleJoin(group.id)}
                >
                  {joiningId === group.id ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Joining...
                    </>
                  ) : group.isJoined ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Joined
                    </>
                  ) : (
                    'Join Group'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredGroups.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              {search.trim()
                ? 'No groups match your search.'
                : 'No groups yet. Create the first one!'}
            </div>
          )}
        </div>
      </main>
    </AppPageShell>
  );
}
