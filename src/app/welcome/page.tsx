
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Smile, ArrowRight, Star, Quote, Users, TrendingUp, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Smile className="size-5" />
                </div>
                <h1 className="text-xl font-bold text-foreground font-headline">Habit Buddies</h1>
                </Link>
                <nav className="hidden items-center gap-6 md:flex">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
                    <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Testimonials</Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How It Works</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
            <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5" />
            <div className="absolute inset-x-0 top-0 -z-20 m-auto h-[40rem] w-[80rem] bg-primary/10 blur-[12rem]" />

            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight font-headline md:text-6xl lg:text-7xl">
                    Build Habits That <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Stick</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Stop breaking promises to yourself. With Habit Buddies, you join a supportive community, track your progress visually, and get AI-powered motivation to finally achieve your goals.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button size="lg" asChild className="shadow-lg shadow-primary/20">
                        <Link href="/login">Find Your Group Today <ArrowRight className="ml-2" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="#features">Learn More</Link>
                    </Button>
                </div>
            </div>
             <div className="container mx-auto mt-16 px-4">
                <div className="relative mx-auto max-w-6xl">
                    <Image
                        src="/images/648a0c7b1a62a3bc444336dd_team-building-activities-for-large-groups-teamland.com.jpg"
                        alt="Habit Buddies Dashboard"
                        width={1200}
                        height={675}
                        className="w-full h-auto rounded-2xl border-4 border-background/20 shadow-2xl object-cover mx-auto"
                        priority
                    />
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Why Habit Buddies Works</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Everything you need to succeed, all in one place.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                               <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Social Accountability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Share your goals with a small group. Your buddies will cheer you on, participate in challenges, and keep you on track.</p>
                        </CardContent>
                    </Card>
                    <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10 mb-4">
                                <TrendingUp className="h-6 w-6 text-accent" />
                            </div>
                            <CardTitle>Visual Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">See your streaks grow and your progress charts climb. Celebrate every small win with visual feedback that motivates.</p>
                        </CardContent>
                    </Card>
                    <Card className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                         <CardHeader>
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-success/10 mb-4">
                               <Sparkles className="h-6 w-6 text-success" />
                            </div>
                            <CardTitle>AI-Powered Motivation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Get personalized encouragement and fun consequence challenges from an AI coach when you need them most.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

         {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
             <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Get Started in 3 Easy Steps</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Joining a community is simple and fast.</p>
                </div>
                <div className="relative">
                    <div className="absolute left-1/2 top-12 hidden h-[calc(100%-3rem)] w-px bg-border/50 md:block"></div>
                     <div className="grid gap-12 md:grid-cols-3">
                        <div className="text-center">
                             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">1</div>
                             <h3 className="mb-2 text-xl font-semibold">Find a Group</h3>
                             <p className="text-muted-foreground">Browse groups based on your interests, like fitness, reading, or mindfulness.</p>
                        </div>
                         <div className="text-center">
                             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">2</div>
                             <h3 className="mb-2 text-xl font-semibold">Join the Community</h3>
                             <p className="text-muted-foreground">Become a member of a group that shares your goals and get ready to collaborate.</p>
                        </div>
                         <div className="text-center">
                             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">3</div>
                             <h3 className="mb-2 text-xl font-semibold">Track & Succeed</h3>
                             <p className="text-muted-foreground">Start tracking your habits, see your progress, and motivate your buddies to succeed together.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Loved by People Worldwide</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Don't just take our word for it. Here's what our members are saying.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col">
                        <CardContent className="flex-grow pt-6">
                            <Quote className="h-8 w-8 text-primary mb-4" />
                            <p className="text-muted-foreground">"I've tried so many habit trackers, but Habit Buddies is the first one that actually worked. The community aspect is a game-changer!"</p>
                        </CardContent>
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar>
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User Alex" data-ai-hint="user avatar" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">Alex R.</p>
                                <p className="text-sm text-muted-foreground">Fitness Fanatics Group</p>
                            </div>
                        </CardHeader>
                    </Card>
                     <Card className="flex flex-col">
                        <CardContent className="flex-grow pt-6">
                            <Quote className="h-8 w-8 text-primary mb-4" />
                            <p className="text-muted-foreground">"The AI nudges are hilarious and surprisingly effective. It's like having a friendly robot keeping you accountable. Highly recommend!"</p>
                        </CardContent>
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar>
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User Jess" data-ai-hint="user avatar" />
                                <AvatarFallback>J</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">Jess T.</p>
                                <p className="text-sm text-muted-foreground">Procrasti-haters Member</p>
                            </div>
                        </CardHeader>
                    </Card>
                     <Card className="flex flex-col">
                        <CardContent className="flex-grow pt-6">
                            <Quote className="h-8 w-8 text-primary mb-4" />
                            <p className="text-muted-foreground">"Finally hit my reading goal for the year, all thanks to my group. Seeing everyone else's progress kept me going."</p>
                        </CardContent>
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar>
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User Mo" data-ai-hint="user avatar" />
                                <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">Mo K.</p>
                                <p className="text-sm text-muted-foreground">Bookworms United</p>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </section>

      </main>

        <footer className="border-t">
             <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 md:grid-cols-3">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Smile className="size-5" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground font-headline">Habit Buddies</h1>
                        </Link>
                        <p className="text-muted-foreground">Build habits, together.</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Navigate</h4>
                        <ul className="space-y-2">
                           <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                           <li><Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</Link></li>
                           <li><Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                     © {new Date().getFullYear()} Ahmed Ibrahim (father-hardstone). All Rights Reserved.
                </div>
            </div>
        </footer>
    </div>
  );
}
