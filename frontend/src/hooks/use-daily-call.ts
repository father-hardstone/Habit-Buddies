'use client';

import * as React from 'react';
import type { DailyCall, DailyParticipant } from '@daily-co/daily-js';
import type { CallMode } from '@/lib/call-constants';

type DailyModule = typeof import('@daily-co/daily-js');

export type CallParticipantState = {
  sessionId: string;
  userName: string;
  isLocal: boolean;
  audio: boolean;
  video: boolean;
};

const remoteAudioEls = new Map<string, HTMLAudioElement>();

function mapParticipant(
  participant: DailyParticipant,
  isLocal: boolean,
): CallParticipantState {
  return {
    sessionId: participant.session_id,
    userName: participant.user_name ?? (isLocal ? 'You' : 'Guest'),
    isLocal,
    audio: participant.audio,
    video: participant.video,
  };
}

function readParticipants(call: DailyCall): CallParticipantState[] {
  const snapshot = call.participants();
  const list: CallParticipantState[] = [];

  if (snapshot.local) {
    list.push(mapParticipant(snapshot.local, true));
  }

  for (const [sessionId, participant] of Object.entries(snapshot)) {
    if (sessionId === 'local') {
      continue;
    }

    list.push(mapParticipant(participant, false));
  }

  return list;
}

function getPlayableAudioTrack(participant: DailyParticipant): MediaStreamTrack | null {
  const audioTrack = participant.tracks?.audio;
  if (!audioTrack) {
    return null;
  }

  const track = audioTrack.persistentTrack ?? audioTrack.track;
  if (!track || track.kind !== 'audio') {
    return null;
  }

  if (audioTrack.state && audioTrack.state !== 'playable' && audioTrack.state !== 'loading') {
    return null;
  }

  return track;
}

function attachRemoteAudioTrack(sessionId: string, track: MediaStreamTrack) {
  let audioEl = remoteAudioEls.get(sessionId);

  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.setAttribute('data-daily-remote-audio', sessionId);
    document.body.appendChild(audioEl);
    remoteAudioEls.set(sessionId, audioEl);
  }

  audioEl.srcObject = new MediaStream([track]);
  void audioEl.play().catch(() => undefined);
}

function detachRemoteAudio(sessionId: string) {
  const audioEl = remoteAudioEls.get(sessionId);
  if (!audioEl) {
    return;
  }

  audioEl.srcObject = null;
  audioEl.remove();
  remoteAudioEls.delete(sessionId);
}

function cleanupRemoteAudio() {
  for (const sessionId of remoteAudioEls.keys()) {
    detachRemoteAudio(sessionId);
  }
}

function attachExistingRemoteAudio(call: DailyCall) {
  const snapshot = call.participants();

  for (const [sessionId, participant] of Object.entries(snapshot)) {
    if (sessionId === 'local' || participant.local) {
      continue;
    }

    const track = getPlayableAudioTrack(participant);
    if (track) {
      attachRemoteAudioTrack(sessionId, track);
    }
  }
}

async function unlockAudioPlayback(call: DailyCall) {
  const startAudio = (call as DailyCall & { startAudio?: () => Promise<void> }).startAudio;
  if (typeof startAudio === 'function') {
    try {
      await startAudio.call(call);
    } catch {
      // Browser may still play after explicit user gesture on join/accept.
    }
  }
}

function hasPlayableRemoteAudio(call: DailyCall): boolean {
  const snapshot = call.participants();

  for (const [sessionId, participant] of Object.entries(snapshot)) {
    if (sessionId === 'local' || participant.local) {
      continue;
    }

    if (getPlayableAudioTrack(participant)) {
      return true;
    }
  }

  return false;
}

export type DailyCallEventHandlers = {
  onRemoteParticipantLeft?: () => void;
};

function wireCallObjectEvents(
  call: DailyCall,
  refresh: () => void,
  setIsJoined: React.Dispatch<React.SetStateAction<boolean>>,
  setIsRemoteAudioReady: React.Dispatch<React.SetStateAction<boolean>>,
  setParticipants: React.Dispatch<React.SetStateAction<CallParticipantState[]>>,
  eventHandlersRef: React.MutableRefObject<DailyCallEventHandlers>,
) {
  const syncRemoteAudioReady = () => {
    setIsRemoteAudioReady(hasPlayableRemoteAudio(call));
  };

  call.on('joined-meeting', () => {
    setIsJoined(true);
    void unlockAudioPlayback(call);
    attachExistingRemoteAudio(call);
    syncRemoteAudioReady();
    refresh();
  });
  call.on('left-meeting', () => {
    setIsJoined(false);
    setIsRemoteAudioReady(false);
    setParticipants([]);
    cleanupRemoteAudio();
  });
  call.on('participant-joined', () => {
    attachExistingRemoteAudio(call);
    syncRemoteAudioReady();
    refresh();
  });
  call.on('participant-updated', (event) => {
    const { participant } = event;
    if (!participant || participant.local) {
      refresh();
      return;
    }

    const track = getPlayableAudioTrack(participant);
    if (track) {
      attachRemoteAudioTrack(participant.session_id, track);
    }

    syncRemoteAudioReady();
    refresh();
  });
  call.on('participant-left', (event) => {
    if (event.participant?.session_id) {
      detachRemoteAudio(event.participant.session_id);
    }

    if (event.participant && !event.participant.local) {
      eventHandlersRef.current.onRemoteParticipantLeft?.();
    }

    syncRemoteAudioReady();
    refresh();
  });
  call.on('track-started', (event) => {
    if (!event.participant || event.participant.local) {
      return;
    }

    if (event.track?.kind !== 'audio') {
      return;
    }

    attachRemoteAudioTrack(event.participant.session_id, event.track);
    syncRemoteAudioReady();
    refresh();
  });
  call.on('track-stopped', (event) => {
    if (!event.participant || event.participant.local) {
      return;
    }

    if (event.track?.kind !== 'audio') {
      return;
    }

    const audioEl = remoteAudioEls.get(event.participant.session_id);
    if (
      audioEl?.srcObject instanceof MediaStream &&
      audioEl.srcObject.getTracks()[0] === event.track
    ) {
      detachRemoteAudio(event.participant.session_id);
    }

    syncRemoteAudioReady();
    refresh();
  });
}

export function useDailyCall() {
  const callRef = React.useRef<DailyCall | null>(null);
  const dailyRef = React.useRef<DailyModule['default'] | null>(null);
  const eventHandlersRef = React.useRef<DailyCallEventHandlers>({});
  const [isJoined, setIsJoined] = React.useState(false);
  const [isRemoteAudioReady, setIsRemoteAudioReady] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [participants, setParticipants] = React.useState<CallParticipantState[]>([]);

  const loadDaily = React.useCallback(async () => {
    if (!dailyRef.current) {
      const module = await import('@daily-co/daily-js');
      dailyRef.current = module.default;
    }

    return dailyRef.current;
  }, []);

  const syncParticipants = React.useCallback((call: DailyCall) => {
    const next = readParticipants(call);
    setParticipants(next);

    const local = next.find((entry) => entry.isLocal);
    if (local) {
      setIsMuted(!local.audio);
    }
  }, []);

  const destroyCall = React.useCallback(async () => {
    const call = callRef.current;

    cleanupRemoteAudio();

    if (!call) {
      return;
    }

    try {
      await call.leave();
    } catch {
      // Room may already be gone.
    }

    try {
      await call.destroy();
    } catch {
      // Already destroyed.
    }

    callRef.current = null;
    setIsJoined(false);
    setIsRemoteAudioReady(false);
    setIsMuted(false);
    setParticipants([]);
  }, []);

  const setCallEventHandlers = React.useCallback((handlers: DailyCallEventHandlers) => {
    eventHandlersRef.current = handlers;
  }, []);

  const join = React.useCallback(
    async (roomUrl: string, token: string, mode: CallMode, userName?: string) => {
      const Daily = await loadDaily();

      if (callRef.current) {
        await destroyCall();
      }

      const call = Daily.createCallObject({
        videoSource: mode === 'video',
        audioSource: true,
        subscribeToTracksAutomatically: true,
        startVideoOff: mode === 'audio',
        startAudioOff: false,
      });

      callRef.current = call;

      setIsRemoteAudioReady(false);

      const refresh = () => syncParticipants(call);
      wireCallObjectEvents(
        call,
        refresh,
        setIsJoined,
        setIsRemoteAudioReady,
        setParticipants,
        eventHandlersRef,
      );

      await call.join({
        url: roomUrl,
        token,
        ...(userName ? { userName } : {}),
      });

      await unlockAudioPlayback(call);

      if (mode === 'audio') {
        await call.setLocalVideo(false);
      }

      await call.setLocalAudio(true);
      attachExistingRemoteAudio(call);
      refresh();
    },
    [destroyCall, loadDaily, syncParticipants],
  );

  const leave = React.useCallback(async () => {
    await destroyCall();
  }, [destroyCall]);

  const toggleMute = React.useCallback(async () => {
    const call = callRef.current;

    if (!call) {
      return;
    }

    const nextMuted = !isMuted;
    await call.setLocalAudio(!nextMuted);
    setIsMuted(nextMuted);
    syncParticipants(call);
  }, [isMuted, syncParticipants]);

  React.useEffect(() => {
    return () => {
      void destroyCall();
    };
  }, [destroyCall]);

  return {
    join,
    leave,
    toggleMute,
    setCallEventHandlers,
    isJoined,
    isRemoteAudioReady,
    isMuted,
    participants,
  };
}
