'use client';

import { Phone, PhoneIncoming, PhoneMissed, PhoneOff, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CallLogEntry } from '@/lib/call-constants';
import { formatCallDuration } from '@/lib/call-timeline';
import { formatMessageTime } from '@/lib/chat-time';

type CallTimelineItemProps = {
  call: CallLogEntry;
  peerName: string;
  isLive?: boolean;
};

function modeLabel(mode: CallLogEntry['mode']) {
  return mode === 'video' ? 'Video call' : 'Voice call';
}

function buildCallCopy(
  call: CallLogEntry,
  peerName: string,
  isLive: boolean,
): { title: string; subtitle: string; tone: 'missed' | 'live' | 'ended' | 'default' } {
  const mode = modeLabel(call.mode).toLowerCase();
  const time = formatMessageTime(call.endedAt ?? call.createdAt);
  const youCalled = `You called ${peerName}`;
  const theyCalled = `${peerName} called you`;

  if (isLive || call.status === 'ongoing') {
    return {
      title: call.isOutgoing ? `Calling ${peerName}…` : `${peerName} is calling…`,
      subtitle: call.isOutgoing ? `${modeLabel(call.mode)} · ringing` : `${modeLabel(call.mode)} · incoming`,
      tone: 'live',
    };
  }

  if (call.status === 'ringing') {
    return {
      title: call.isOutgoing ? `Calling ${peerName}…` : `${peerName} is calling…`,
      subtitle: time,
      tone: 'live',
    };
  }

  if (call.status === 'missed' || call.status === 'declined') {
    return {
      title: call.isOutgoing ? `No answer · ${youCalled}` : `Missed ${mode} · ${theyCalled}`,
      subtitle: time,
      tone: 'missed',
    };
  }

  if (call.status === 'ended') {
    const duration = formatCallDuration(call.durationSeconds);
    return {
      title: call.isOutgoing
        ? `${youCalled} · ${duration}`
        : `${theyCalled} · ${duration}`,
      subtitle: time,
      tone: 'ended',
    };
  }

  return {
    title: call.isOutgoing ? youCalled : theyCalled,
    subtitle: time,
    tone: 'default',
  };
}

export function CallTimelineItem({ call, peerName, isLive = false }: CallTimelineItemProps) {
  const { title, subtitle, tone } = buildCallCopy(call, peerName, isLive);
  const Icon =
    tone === 'missed'
      ? PhoneMissed
      : tone === 'live'
        ? PhoneIncoming
        : tone === 'ended'
          ? PhoneOff
          : call.mode === 'video'
            ? Video
            : Phone;

  return (
    <div
      className={cn(
        'flex py-1',
        call.isOutgoing ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'inline-flex max-w-[min(88%,22rem)] items-center gap-2 rounded-xl px-3 py-2 text-xs shadow-sm backdrop-blur',
          tone === 'missed' &&
            'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-100',
          tone === 'live' &&
            'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
          tone === 'ended' &&
            'bg-[#d9fdd3] text-[#111b21] dark:bg-emerald-950/30 dark:text-emerald-50',
          tone === 'default' &&
            'bg-[#ffffffd9] text-[#54656f] dark:bg-muted dark:text-muted-foreground',
          call.isOutgoing && tone === 'ended' && 'bg-[#d9fdd3]',
          !call.isOutgoing && tone === 'ended' && 'bg-white dark:bg-muted',
        )}
      >
        <Icon
          className={cn(
            'size-4 shrink-0',
            tone === 'live' && 'animate-pulse text-emerald-600 dark:text-emerald-300',
            tone === 'missed' && 'text-red-600 dark:text-red-300',
          )}
        />
        <div className="min-w-0 text-left">
          <p className="font-medium leading-tight">{title}</p>
          <p className="truncate opacity-80">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
