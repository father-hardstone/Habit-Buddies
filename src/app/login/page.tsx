
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
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isValidEmail, setIsValidEmail] = React.useState(true);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setError(''); // Clear error when user types
        
        if (newEmail && !validateEmail(newEmail)) {
            setIsValidEmail(false);
        } else {
            setIsValidEmail(true);
        }
    };

    const handleLogin = async () => {
        // Clear previous errors
        setError('');
        
        // Validate email format
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password (basic check)
        if (password.length < 3) {
            setError('Password must be at least 3 characters long');
            return;
        }

        setIsLoading(true);

        try {
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
            else if (emailName === 'ibrahim') userId = 7;
            
            // Check if it's a valid demo user
            const validDemoUsers = ['user', 'alex', 'jess', 'mo', 'sara', 'ben', 'ibrahim'];
            if (!validDemoUsers.includes(emailName)) {
                setError('Invalid demo user. Please use one of the suggested emails.');
                setIsLoading(false);
                return;
            }
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            login(userId);
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleLogin();
        }
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
                                onChange={handleEmailChange}
                                onKeyPress={handleKeyPress}
                                className={!isValidEmail && email ? 'border-destructive' : ''}
                                disabled={isLoading}
                            />
                            {!isValidEmail && email && (
                                <p className="text-sm text-destructive">Please enter a valid email address</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        {error && (
                            <div className="w-full p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button 
                            className="w-full" 
                            onClick={handleLogin}
                            disabled={isLoading || !isValidEmail || password.length < 3}
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Logging In...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Demo: Try user@email.com, alex@email.com, jess@email.com, mo@email.com, sara@email.com, ben@email.com, or ibrahim@email.com
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
