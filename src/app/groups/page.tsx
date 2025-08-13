import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function GroupsPage() {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
          <h1 className="text-2xl font-bold font-headline">Groups</h1>
          <Button>Create Group</Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Image src="https://placehold.co/400x300.png" alt="Coming Soon" width={400} height={300} className="rounded-lg" data-ai-hint="teamwork collaboration" />
              <p className="text-muted-foreground">The full group management feature is under construction. <br/> Get ready to team up with your buddies!</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarLayout>
  );
}
