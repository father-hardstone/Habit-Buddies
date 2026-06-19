'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  Loader2,
  Mic,
  MicOff,
  Minus,
  Phone,
  PhoneOff,
  Video,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActiveCallState, CallPhase } from '@/lib/call-constants';
import { formatCallDuration } from '@/lib/call-timeline';

type CallWindowProps = {
  phase: CallPhase;
  activeCall: ActiveCallState | null;
  incomingInvite: {
    peerName: string;
    peerAvatar: string;
    mode: ActiveCallState['mode'];
  } | null;
  localAvatar: string;
  localName: string;
  isMinimized: boolean;
  elapsedSeconds: number;
  endedMessage: string | null;
  isJoined: boolean;
  isMuted: boolean;
  isStarting?: boolean;
  onToggleMute: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onEndCall: () => void;
  onAcceptIncoming: () => void;
  onDeclineIncoming: () => void;
  isAccepting?: boolean;
  isEnding?: boolean;
  calleeAccepted?: boolean;
  isAwaitingMedia?: boolean;
};

function ParticipantAvatar({
  name,
  avatar,
  label,
  isSpeaking,
  size = 'lg',
}: {
  name: string;
  avatar: string;
  label?: string;
  isSpeaking?: boolean;
  size?: 'lg' | 'md';
}) {
  const dimension = size === 'lg' ? 'size-24' : 'size-16';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'rounded-full p-0.5 transition-shadow',
          isSpeaking && 'shadow-[0_0_0_3px_rgba(37,211,102,0.55)]',
        )}
      >
        <Avatar className={cn(dimension, 'border-2 border-white/20 shadow-lg')}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-[#25d366]/20 text-lg font-semibold text-white">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="text-center">
        {label ? (
          <p className="text-[11px] uppercase tracking-wide text-white/50">{label}</p>
        ) : null}
        <p className="max-w-[7rem] truncate text-sm font-medium text-white">{name}</p>
      </div>
    </div>
  );
}

function phaseLabel(
  phase: CallPhase,
  activeCall: ActiveCallState | null,
  incomingPeerName?: string,
): string {
  switch (phase) {
    case 'starting':
    case 'outgoing':
      return `Calling ${activeCall?.peerName ?? '…'}`;
    case 'incoming':
      return `${incomingPeerName ?? 'Someone'} is calling`;
    case 'joining':
      return 'Connecting…';
    case 'active':
      return activeCall?.mode === 'video' ? 'On a video call' : 'On a voice call';
    case 'still_there':
      return 'Call in progress';
    case 'ended_message':
      return 'Call ended';
    default:
      return 'Call';
  }
}

function phaseSubtitle(
  phase: CallPhase,
  mode: ActiveCallState['mode'],
  elapsedSeconds: number,
  isStarting: boolean,
  calleeAccepted: boolean,
  isAwaitingMedia: boolean,
): string | null {
  switch (phase) {
    case 'incoming':
      return `${mode === 'video' ? 'Video' : 'Voice'} call`;
    case 'starting':
    case 'outgoing':
      if (isStarting) {
        return 'Starting call…';
      }
      if (calleeAccepted || isAwaitingMedia) {
        return 'Connecting voice…';
      }
      return 'Ringing…';
    case 'joining':
      return isAwaitingMedia ? 'Connecting voice…' : 'Connecting…';
    case 'active':
    case 'still_there':
      return formatCallDuration(elapsedSeconds);
    default:
      return null;
  }
}

export function CallWindow({
  phase,
  activeCall,
  incomingInvite,
  localAvatar,
  localName,
  isMinimized,
  elapsedSeconds,
  endedMessage,
  isJoined,
  isMuted,
  isStarting = false,
  onToggleMute,
  onMinimize,
  onMaximize,
  onClose,
  onEndCall,
  onAcceptIncoming,
  onDeclineIncoming,
  isAccepting = false,
  isEnding = false,
  calleeAccepted = false,
  isAwaitingMedia = false,
}: CallWindowProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const visible =
    phase !== 'idle' &&
    (activeCall != null || incomingInvite != null || phase === 'ended_message');

  if (!visible || !mounted) {
    return null;
  }

  const mode = activeCall?.mode ?? incomingInvite?.mode ?? 'audio';
  const ModeIcon = mode === 'video' ? Video : Phone;
  const peerName = activeCall?.peerName ?? incomingInvite?.peerName ?? 'Contact';
  const peerAvatar = activeCall?.peerAvatar ?? incomingInvite?.peerAvatar ?? '';
  const isLive = phase === 'active' || phase === 'still_there';
  const isOutgoingRing =
    !isLive && (phase === 'outgoing' || phase === 'starting' || phase === 'joining');
  const showConnectingOverlay = isAwaitingMedia && isJoined;
  const canMute = isLive && isJoined;

  const panel = isMinimized && phase !== 'ended_message' ? (
    <button
      type="button"
      onClick={onMaximize}
      className="fixed bottom-20 right-4 z-[100] flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-[#20bd5a] md:bottom-6"
    >
      <ModeIcon className="size-4" />
      {phase === 'incoming' ? 'Incoming call' : formatCallDuration(elapsedSeconds)}
    </button>
  ) : (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-3 pointer-events-none md:p-4">
      <div
        className={cn(
          'pointer-events-auto flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[#d1d7db] bg-[#111b21] text-white shadow-2xl dark:border-border',
          phase === 'ended_message' ? 'max-w-xs' : 'h-[min(24rem,72vh)]',
        )}
      >
        <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {phaseLabel(phase, activeCall, incomingInvite?.peerName)}
            </p>
            <p className="truncate text-xs text-white/55">
              {phaseSubtitle(
                phase,
                mode,
                elapsedSeconds,
                isStarting,
                calleeAccepted,
                isAwaitingMedia,
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {phase !== 'ended_message' ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/10 hover:text-white"
                onClick={onMinimize}
                aria-label="Minimize call"
              >
                <Minus className="size-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/10 hover:text-white"
              onClick={onClose}
              aria-label="Close call window"
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        {phase === 'ended_message' ? (
          <div className="px-4 py-8 text-center">
            <PhoneOff className="mx-auto mb-3 size-8 text-white/70" />
            <p className="text-sm text-white/90">{endedMessage}</p>
          </div>
        ) : (
          <>
            <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
              {phase === 'incoming' ? (
                <ParticipantAvatar
                  name={peerName}
                  avatar={peerAvatar}
                  size="lg"
                  label="Incoming"
                />
              ) : (
                <div className="flex items-center gap-8">
                  <ParticipantAvatar
                    name={localName}
                    avatar={localAvatar}
                    label="You"
                    isSpeaking={isLive && isJoined && !isMuted}
                  />
                  <ParticipantAvatar
                    name={peerName}
                    avatar={peerAvatar}
                    label={isOutgoingRing ? 'Ringing' : 'On call'}
                    isSpeaking={isLive && isJoined}
                  />
                </div>
              )}

              {showConnectingOverlay ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111b21]/55 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm text-white/90">
                    <Loader2 className="size-4 animate-spin" />
                    Connecting voice…
                  </div>
                </div>
              ) : null}

              {isOutgoingRing && !showConnectingOverlay ? (
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white/80">
                  {isStarting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Starting call…
                    </>
                  ) : calleeAccepted || isAwaitingMedia ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Connecting voice…
                    </>
                  ) : (
                    <>
                      <span className="size-2 animate-pulse rounded-full bg-[#25d366]" />
                      Ringing {peerName}…
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <footer className="flex items-center justify-center gap-3 border-t border-white/10 px-4 py-4">
              {phase === 'incoming' ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="size-12 rounded-full active:scale-95"
                    onClick={onDeclineIncoming}
                    disabled={isAccepting || isEnding}
                    aria-label="Decline call"
                  >
                    <PhoneOff className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    className="size-12 rounded-full bg-[#25d366] text-white hover:bg-[#20bd5a] active:scale-95"
                    onClick={onAcceptIncoming}
                    disabled={isAccepting || isEnding}
                    aria-label="Accept call"
                  >
                    {isAccepting ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Phone className="size-5" />
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {canMute ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-12 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
                      onClick={() => void onToggleMute()}
                      disabled={!isJoined || isEnding}
                      aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="size-12 rounded-full active:scale-95"
                    onClick={onEndCall}
                    disabled={isEnding}
                    aria-label="End call"
                  >
                    <PhoneOff className="size-5" />
                  </Button>
                </>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
