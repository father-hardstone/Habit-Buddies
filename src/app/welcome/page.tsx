
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Smile } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <header className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Smile className="size-5" />
          </div>
          <h1 className="text-lg font-bold text-foreground font-headline">Habit Buddies</h1>
        </Link>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <section className="container mx-auto max-w-4xl py-12">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Build Habits, Together.</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Stop breaking promises to yourself. Join a community of supportive buddies, track your progress, and finally make your habits stick.
            </p>
            <Button size="lg" asChild>
                <Link href="/login">Join a Group Today</Link>
            </Button>
             <div className="mt-12 relative">
                <Image 
                    src="https://placehold.co/1200x600.png"
                    alt="Habit Buddies Dashboard"
                    width={1200}
                    height={600}
                    className="rounded-xl shadow-2xl border-4 border-background"
                    data-ai-hint="app dashboard screenshot"
                />
            </div>
        </section>

        <section className="container mx-auto max-w-5xl py-20">
            <h3 className="text-3xl font-bold font-headline mb-10">Why Habit Buddies Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="text-success" /> Social Accountability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Share your goals with a small group. Your buddies will cheer you on and keep you on track.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="text-success" /> Visual Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground">See your streaks grow and your progress charts climb. Celebrate every small win!</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="text-success" /> AI-Powered Motivation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Get personalized encouragement and fun consequence challenges when you need them most.</p>
                    </CardContent>
                </Card>
            </div>
        </section>

      </main>
        <footer className="text-center p-4 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Habit Buddies. All Rights Reserved.
        </footer>
    </div>
  );
}
