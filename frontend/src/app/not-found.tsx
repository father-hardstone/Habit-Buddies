'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-8" />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-bold font-headline">Page not found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => router.push('/')}>
          Go to dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push('/groups')}>
          Browse groups
        </Button>
      </div>
    </div>
  );
}
