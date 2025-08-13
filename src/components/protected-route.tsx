
'use client';
import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Smile } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/welcome');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Smile className="size-6 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground font-headline">Habit Buddies</h1>
                </div>
                <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
        );
    }

    return <>{children}</>;
}
