
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
    const [email, setEmail] = React.useState('user@email.com');
    const [password, setPassword] = React.useState('password');

    const handleLogin = () => {
        // Extract user ID from email for demo purposes
        // In a real app, you'd verify credentials against a backend
        const emailName = email.split('@')[0];
        let userId = 1; // Default to user 1
        
        // Map common email prefixes to user IDs for demo
        if (emailName === 'alex') userId = 2;
        else if (emailName === 'jess') userId = 3;
        else if (emailName === 'mo') userId = 4;
        else if (emailName === 'sara') userId = 5;
        else if (emailName === 'ben') userId = 6;
        
        login(userId);
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
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="user@email.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" onClick={handleLogin}>
                            Log In
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Demo: Try user@email.com, alex@email.com, jess@email.com, mo@email.com, sara@email.com, or ben@email.com
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
