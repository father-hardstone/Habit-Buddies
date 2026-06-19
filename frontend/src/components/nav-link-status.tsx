'use client';

import { useLinkStatus } from 'next/link';import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function NavLinkIcon({ icon: Icon }: { icon: LucideIcon }) {
  const { pending } = useLinkStatus();

  if (pending) {
    return <Skeleton className="size-4 shrink-0 rounded-sm" />;
  }

  return <Icon className="size-4 shrink-0" />;
}

export function NavLinkLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <span className={pending ? 'opacity-70' : undefined}>{label}</span>
  );
}
