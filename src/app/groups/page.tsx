
'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Users, PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllGroups } from '@/lib/database';
import { ProtectedRoute } from '@/components/protected-route';
import { SidebarTrigger } from '@/components/ui/sidebar';

function GroupsPageContent() {
  const groups = getAllGroups();

  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
          <div className="flex items-center gap-2 self-start">
             <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="text-2xl font-bold font-headline">Discover Groups</h1>
              <p className="text-muted-foreground">Find a community to share your journey with.</p>
            </div>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search groups..." className="pl-9 w-full" />
            </div>
            <Button>
                <PlusCircle className="mr-2" />
                Create Group
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                <Image src={group.image} alt={group.name} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={group.aiHint} />
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                   <div className="flex flex-wrap gap-2">
                        {group.tags.map(tag => (
                            <span key={tag} className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{group.members} members</span>
                  </div>
                  <Button variant="outline">Join Group</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}

export default function GroupsPage() {
    return (
        <ProtectedRoute>
            <GroupsPageContent />
        </ProtectedRoute>
    )
}
