import { SidebarLayout } from '@/components/sidebar-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Users, PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const groups = [
  {
    id: '1',
    name: 'Procrasti-haters',
    description: 'For those who want to beat procrastination and get things done. We focus on productivity hacks and mutual support.',
    members: 12,
    image: 'https://placehold.co/600x400.png',
    tags: ['productivity', 'focus'],
    aiHint: 'team working',
  },
  {
    id: '2',
    name: 'Early Birds Club',
    description: 'Wake up and seize the day! This group is for people who want to build a consistent morning routine.',
    members: 25,
    image: 'https://placehold.co/600x400.png',
    tags: ['morning', 'routine', 'health'],
    aiHint: 'sunrise yoga',
  },
  {
    id: '3',
    name: 'Fitness Fanatics',
    description: 'Whether you\'re a gym rat or a home workout warrior, join us to stay motivated and accountable for your fitness goals.',
    members: 8,
    image: 'https://placehold.co/600x400.png',
    tags: ['fitness', 'health', 'exercise'],
    aiHint: 'group workout',
  },
  {
    id: '4',
    name: 'Mindful Moments',
    description: 'A space to cultivate mindfulness through meditation, journaling, and other reflective practices. All levels welcome.',
    members: 31,
    image: 'https://placehold.co/600x400.png',
    tags: ['meditation', 'mental health', 'journaling'],
    aiHint: 'calm meditation',
  },
    {
    id: '5',
    name: 'Bookworms United',
    description: 'Dedicated to the habit of reading. Share your current reads, find recommendations, and join reading sprints.',
    members: 18,
    image: 'https://placehold.co/600x400.png',
    tags: ['reading', 'books', 'learning'],
    aiHint: 'reading books',
  },
  {
    id: '6',
    name: 'Hydration Nation',
    description: 'A simple group with a simple goal: drink more water. Let\'s remind each other to stay hydrated and healthy.',
    members: 42,
    image: 'https://placehold.co/600x400.png',
    tags: ['health', 'water'],
    aiHint: 'drinking water',
  },
];

export default function GroupsPage() {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-headline">Discover Groups</h1>
            <p className="text-muted-foreground">Find a community to share your journey with.</p>
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