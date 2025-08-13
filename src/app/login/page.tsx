
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Smile } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        // In a real app, you'd get this from the form and verify credentials
        const DEMO_USER_ID = 1; 
        login(DEMO_USER_ID);
        router.push('/');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
            <div className="w-full max-w-md">
                 <Link href="/welcome" className="flex items-center justify-center gap-2.5 mb-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Smile className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground font-headline">Habit Buddies</h1>
                </Link>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Welcome Back!</CardTitle>
                        <CardDescription>Log in to continue your journey.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="user@email.com" defaultValue="user@email.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" defaultValue="password" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" onClick={handleLogin}>
                            Log In
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            This is a demo. Click "Log In" to continue.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
