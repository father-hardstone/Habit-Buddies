'use client';

import Link from 'next/link';
import * as React from 'react';
import { Globe, Lock, Smile, UserPlus, Users } from 'lucide-react';
import type { Group } from '@/lib/database';
import { cn } from '@/lib/utils';

function getGroupImageUrl(group: Group) {
  if (group.image?.startsWith('http')) {
    return group.image;
  }

  return `https://placehold.co/800x480/9333ea/ffffff?text=${encodeURIComponent(group.name.slice(0, 20))}`;
}

export function InviteGroupPanel({ group }: { group: Group }) {
  return (
    <div className="relative flex min-h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-primary-foreground sm:p-10 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

      <Link
        href="/welcome"
        prefetch
        className="relative z-10 inline-flex w-fit items-center gap-2.5 rounded-lg px-2 py-1 transition-opacity hover:opacity-90"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Smile className="size-6" />
        </div>
        <span className="text-2xl font-bold font-headline">Habit Buddies</span>
      </Link>

      <div className="relative z-10 my-8 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
          <UserPlus className="size-4" />
          Group invitation
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getGroupImageUrl(group)}
            alt=""
            className="h-40 w-full object-cover sm:h-48"
          />
          <div className="space-y-4 bg-black/20 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-bold font-headline leading-tight sm:text-3xl">
                {group.name}
              </h2>
              {group.isPublic ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
                  <Globe className="size-3" />
                  Public
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                  <Lock className="size-3" />
                  Private
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              {group.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/85">
              <span>Created by {group.creatorName}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" />
                {group.members} member{group.members === 1 ? '' : 's'}
              </span>
            </div>

            {group.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="max-w-md text-lg text-primary-foreground/90">
          Log in or create an account to join this group and start building habits together.
        </p>
      </div>

      <p className="relative z-10 text-sm text-primary-foreground/70">
        © {new Date().getFullYear()} Habit Buddies
      </p>
    </div>
  );
}

export function InviteAuthPanel({
  children,
  title,
  subtitle,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center px-4 py-10 sm:px-8 lg:px-14">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-headline tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(['login', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                'rounded-lg py-2.5 text-center text-sm font-medium transition-all duration-150',
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export function InvitePageLayout({
  group,
  children,
  mobileGroupSummary,
}: {
  group: Group;
  children: React.ReactNode;
  mobileGroupSummary?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid bg-background lg:grid-cols-2">
      <div className="hidden lg:block">
        <InviteGroupPanel group={group} />
      </div>
      <div className="min-h-screen">
        {mobileGroupSummary}
        {children}
      </div>
    </div>
  );
}
