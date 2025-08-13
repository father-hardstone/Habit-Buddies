import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm md:p-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, let's make today productive!</p>
      </div>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Habit
      </Button>
    </header>
  );
}
