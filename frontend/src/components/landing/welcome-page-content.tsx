'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  MessageSquare,
  Quote,
  Smile,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingHeader } from '@/components/landing/landing-header';
import { Parallax } from '@/components/landing/parallax';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Users,
    title: 'Social Accountability',
    description:
      'Share goals with a small group. Your buddies cheer you on, join challenges, and keep you honest.',
    tone: 'primary' as const,
  },
  {
    icon: TrendingUp,
    title: 'Visual Progress',
    description:
      'Watch streaks grow and charts climb. Every small win gets the visual feedback it deserves.',
    tone: 'accent' as const,
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Motivation',
    description:
      'Get personalized nudges and playful consequence challenges from an AI coach when you need a push.',
    tone: 'success' as const,
  },
];

const steps = [
  {
    number: '1',
    title: 'Find a Group',
    description: 'Browse communities for fitness, reading, mindfulness, and more.',
  },
  {
    number: '2',
    title: 'Join the Community',
    description: 'Become part of a crew that shares your goals and energy.',
  },
  {
    number: '3',
    title: 'Track & Succeed',
    description: 'Log habits, climb leaderboards, and celebrate wins together.',
  },
];

const testimonials = [
  {
    quote:
      "I've tried so many habit trackers, but Habit Buddies is the first one that actually worked. The community aspect is a game-changer!",
    name: 'Alex R.',
    role: 'Fitness Fanatics Group',
    initial: 'A',
  },
  {
    quote:
      "The AI nudges are hilarious and surprisingly effective. It's like having a friendly robot keeping you accountable.",
    name: 'Jess T.',
    role: 'Procrasti-haters Member',
    initial: 'J',
  },
  {
    quote:
      "Finally hit my reading goal for the year thanks to my group. Seeing everyone else's progress kept me going.",
    name: 'Mo K.',
    role: 'Bookworms United',
    initial: 'M',
  },
];

const stats = [
  { value: '3×', label: 'More likely to stay consistent' },
  { value: '24/7', label: 'Chat & accountability with buddies' },
  { value: '100%', label: 'Free to start building habits' },
];

function toneClasses(tone: 'primary' | 'accent' | 'success') {
  if (tone === 'accent') {
    return 'bg-accent/10 text-accent';
  }
  if (tone === 'success') {
    return 'bg-success/10 text-success';
  }
  return 'bg-primary/10 text-primary';
}

function HeroGlowOrbs() {
  return (
    <>
      <Parallax speed={0.35} className="pointer-events-none absolute -left-24 top-20 -z-10 hidden lg:block">
        <div className="size-72 animate-pulse-soft rounded-full bg-primary/20 blur-3xl" />
      </Parallax>
      <Parallax speed={-0.25} className="pointer-events-none absolute -right-16 top-40 -z-10 hidden lg:block">
        <div className="size-64 animate-pulse-soft rounded-full bg-accent/20 blur-3xl [animation-delay:1.5s]" />
      </Parallax>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 m-auto h-[36rem] w-[70rem] bg-primary/10 blur-[120px]" />
    </>
  );
}

export function WelcomePageContent() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background font-body text-foreground">
      <LandingHeader />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-24">
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.035]" />
          <HeroGlowOrbs />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div
                className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: '120ms' }}
              >
                <Zap className="size-4" />
                Build habits with people who show up
              </div>

              <h1
                className="animate-fade-up font-headline text-4xl font-extrabold tracking-tight opacity-0 sm:text-5xl md:text-6xl lg:text-7xl [animation-fill-mode:forwards]"
                style={{ animationDelay: '220ms' }}
              >
                Build Habits That{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                  Stick
                </span>
              </h1>

              <p
                className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-muted-foreground opacity-0 md:text-xl [animation-fill-mode:forwards]"
                style={{ animationDelay: '340ms' }}
              >
                Stop breaking promises to yourself. Join supportive groups, track progress
                visually, chat with your buddies, and get AI motivation when momentum fades.
              </p>

              <div
                className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-4 opacity-0 sm:flex-row [animation-fill-mode:forwards]"
                style={{ animationDelay: '460ms' }}
              >
                <Button size="lg" asChild className="h-12 px-8 shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]">
                  <Link href="/signup" prefetch>
                    Find Your Group Today
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>

            <Parallax speed={0.22} className="relative mx-auto mt-16 max-w-5xl">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-2 shadow-2xl shadow-primary/10 backdrop-blur-sm">
                <div className="animate-float">
                  <Image
                    src="/images/648a0c7b1a62a3bc444336dd_team-building-activities-for-large-groups-teamland.com.jpg"
                    alt="Habit Buddies community dashboard preview"
                    width={1200}
                    height={675}
                    className="h-auto w-full rounded-xl object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border/60 bg-background/90 p-4 shadow-xl backdrop-blur-md md:block animate-float [animation-delay:1s]">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                    <TrendingUp className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">12-day streak</p>
                    <p className="text-xs text-muted-foreground">Morning workout crew</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 top-8 hidden rounded-2xl border border-border/60 bg-background/90 p-4 shadow-xl backdrop-blur-md lg:block animate-float [animation-delay:2s]">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <MessageSquare className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Buddy check-in</p>
                    <p className="text-xs text-muted-foreground">“You’ve got this today!”</p>
                  </div>
                </div>
              </div>
            </Parallax>

            <ScrollReveal className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3" delay={100}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-card/50 px-5 py-6 text-center backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                >
                  <p className="font-headline text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative py-20 md:py-28">
          <div className="absolute inset-0 -z-10 bg-secondary/40" />
          <Parallax speed={0.12} className="pointer-events-none absolute right-0 top-10 -z-10 hidden md:block">
            <div className="h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          </Parallax>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Why it works
              </p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">
                Everything you need to stay consistent
              </h2>
              <p className="mt-4 text-muted-foreground">
                Habits stick faster when progress is visible, social, and a little bit fun.
              </p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 120}>
                  <Card className="group h-full border-border/60 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5">
                    <CardHeader>
                      <div
                        className={cn(
                          'mb-4 flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                          toneClasses(feature.tone),
                        )}
                      >
                        <feature.icon className="size-6" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Simple start
              </p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">
                Get started in 3 easy steps
              </h2>
              <p className="mt-4 text-muted-foreground">
                From signup to your first streak in minutes — not months.
              </p>
            </ScrollReveal>

            <div className="relative mx-auto max-w-5xl">
              <div className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-primary/40 via-border to-transparent md:block" />

              <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                {steps.map((step, index) => (
                  <ScrollReveal key={step.number} delay={index * 150} direction={index === 1 ? 'up' : index === 0 ? 'left' : 'right'}>
                    <div className="relative text-center">
                      <div className="relative z-10 mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary font-headline text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
                        {step.number}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="relative py-20 md:py-28">
          <div className="absolute inset-0 -z-10 bg-secondary/40" />
          <Parallax speed={-0.1} className="pointer-events-none absolute -left-20 bottom-0 -z-10 hidden h-80 w-80 rounded-full bg-primary/10 blur-3xl md:block" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Real stories
              </p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">
                Loved by people worldwide
              </h2>
              <p className="mt-4 text-muted-foreground">
                Don&apos;t take our word for it — hear from members building better routines.
              </p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item, index) => (
                <ScrollReveal key={item.name} delay={index * 100}>
                  <Card className="flex h-full flex-col border-border/60 bg-background/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="flex-grow pt-6">
                      <Quote className="mb-4 size-8 text-primary/70" />
                      <p className="leading-relaxed text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
                    </CardContent>
                    <CardHeader className="flex-row items-center gap-4 border-t border-border/50">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${item.initial}`} alt={item.name} />
                        <AvatarFallback>{item.initial}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </div>
                    </CardHeader>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-accent px-6 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/25 md:px-12 md:py-16">
                <Parallax speed={0.08} className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
                <Parallax speed={-0.08} className="pointer-events-none absolute -bottom-12 -left-8 size-52 rounded-full bg-black/10 blur-2xl" />

                <h2 className="font-headline text-3xl font-bold sm:text-4xl">
                  Ready to build habits that actually stick?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
                  Join a group, track your progress, chat with buddies, and show up for yourself —
                  together.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-foreground">
                    <Link href="/signup" prefetch>
                      Create free account
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-12 border-primary-foreground/30 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <Link href="/login" prefetch>Log in</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <ScrollReveal direction="none" duration={500}>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <Link href="/welcome" className="mb-4 flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Smile className="size-5" />
                  </div>
                  <span className="font-headline text-xl font-bold">Habit Buddies</span>
                </Link>
                <p className="text-muted-foreground">Build habits, together.</p>
              </div>
              <div>
                <h4 className="mb-3 font-semibold">Navigate</h4>
                <ul className="space-y-2">
                  {[
                    { href: '#features', label: 'Features' },
                    { href: '#testimonials', label: 'Testimonials' },
                    { href: '#how-it-works', label: 'How It Works' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-semibold">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ahmed Ibrahim (father-hardstone). All Rights Reserved.
            </div>
          </ScrollReveal>
        </div>
      </footer>
    </div>
  );
}
