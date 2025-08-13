
'use client';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { XCircle } from 'lucide-react';
import { getJoinedGroups } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { SidebarTrigger } from '@/components/ui/sidebar';

function ProfilePageContent() {
  const { user } = useAuth();
  
  // The user is guaranteed to be non-null here because of ProtectedRoute
  const joinedGroups = getJoinedGroups(user!.id);

  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-bold font-headline">My Profile</h1>
          </div>
          <Button>Save Changes</Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>This is how others will see you on the site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user!.profileUrl} data-ai-hint="user avatar" />
                      <AvatarFallback>{user!.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue={user!.username} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user!.email} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>My Groups</CardTitle>
                        <CardDescription>Groups you have joined.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {joinedGroups.map(group => (
                            <div key={group.id} className="flex items-center gap-4">
                                <Image src={group.image} alt={group.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" data-ai-hint={group.aiHint} />
                                <div className="flex-grow">
                                    <p className="font-semibold">{group.name}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                    <XCircle className="h-5 w-5" />
                                    <span className="sr-only">Leave group</span>
                                </Button>
                            </div>
                        ))}
                         {joinedGroups.length === 0 && (
                            <p className="text-center text-muted-foreground text-sm pt-4">You haven't joined any groups yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}


export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfilePageContent />
        </ProtectedRoute>
    )
}
