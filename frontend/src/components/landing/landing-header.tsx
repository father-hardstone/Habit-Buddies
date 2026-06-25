'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#testimonials', label: 'Testimonials' },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-500',
        scrolled
          ? 'border-border/80 bg-background/85 shadow-sm backdrop-blur-xl'
          : 'border-transparent bg-transparent',
        mounted ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/welcome" className="group flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
              <Smile className="size-5" />
            </div>
            <span className="font-headline text-xl font-bold">Habit Buddies</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login" prefetch>
                Log In
              </Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/20">
              <Link href="/signup" prefetch>
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        <div
          className={cn(
            'overflow-hidden border-t transition-all duration-300 md:hidden',
            mobileOpen ? 'max-h-80 border-border/60 pb-4 opacity-100' : 'max-h-0 border-transparent opacity-0',
          )}
        >
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 px-1">
              <Button variant="outline" asChild>
                <Link href="/login" prefetch onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup" prefetch onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
