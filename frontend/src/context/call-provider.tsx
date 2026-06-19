'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDailyCall } from '@/hooks/use-daily-call';
import { primeCallSounds, playCallDisconnected, useCallSounds } from '@/hooks/use-call-sounds';
import {
  acceptChatCall,
  createChatCall,
  declineChatCall,
  endChatCall,
  markChatCallMissed,
} from '@/lib/calls-api';
import {
  CALL_DURATION_CHECK_MS,
  CALL_END_RETURN_MS,
  CALL_RING_TIMEOUT_MS,
  CALL_STILL_THERE_TIMEOUT_MS,
  type ActiveCallState,
  type CallConfirmTarget,
  type CallEventPayload,
  type CallInvitePayload,
  type CallPhase,
} from '@/lib/call-constants';
import { handleAsyncError } from '@/lib/error-utils';
import { broadcastCallEnd } from '@/lib/call-realtime';
import {
  registerInboxCallListener,
  type InboxCallEvent,
} from '@/lib/inbox-call-bridge';
import { ApiError } from '@/lib/api-client';
import { CallStillThereDialog } from '@/components/calls/call-still-there-dialog';
import { CallWindow } from '@/components/calls/call-window';

type CallContextValue = {
  requestCall: (target: CallConfirmTarget) => void;
  activeCallChatId: string | null;
  liveCallId: string | null;
  callRevision: number;
};

const CallContext = React.createContext<CallContextValue | null>(null);

export function useCallContext() {
  const context = React.useContext(CallContext);

  if (!context) {
    throw new Error('useCallContext must be used within CallProvider');
  }

  return context;
}

type IncomingInviteState = CallInvitePayload & {
  role: 'callee';
};

function isPendingCallId(callId: string | undefined): boolean {
  return Boolean(callId?.startsWith('pending-'));
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { join, leave, toggleMute, setCallEventHandlers, isJoined, isRemoteAudioReady, isMuted } =
    useDailyCall();

  const [phase, setPhase] = React.useState<CallPhase>('idle');
  const [activeCall, setActiveCall] = React.useState<ActiveCallState | null>(null);
  const [incomingInvite, setIncomingInvite] = React.useState<IncomingInviteState | null>(
    null,
  );
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [endedMessage, setEndedMessage] = React.useState<string | null>(null);
  const [stillThereOpen, setStillThereOpen] = React.useState(false);
  const [stillThereSecondsLeft, setStillThereSecondsLeft] = React.useState(0);
  const [callRevision, setCallRevision] = React.useState(0);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);
  const [calleeAccepted, setCalleeAccepted] = React.useState(false);
  const isEndingRef = React.useRef(false);
  const localHangupRef = React.useRef(false);

  const phaseRef = React.useRef(phase);
  const activeCallRef = React.useRef(activeCall);
  const incomingInviteRef = React.useRef(incomingInvite);
  const segmentStartedAtRef = React.useRef<number | null>(null);
  const waitingForAnswerRef = React.useRef(false);
  const outboundGenerationRef = React.useRef(0);
  const ringTimerRef = React.useRef<number>();
  const durationTimerRef = React.useRef<number>();
  const stillThereTimerRef = React.useRef<number>();
  const stillThereCountdownRef = React.useRef<number>();
  const endReturnTimerRef = React.useRef<number>();

  phaseRef.current = phase;
  activeCallRef.current = activeCall;
  incomingInviteRef.current = incomingInvite;

  useCallSounds(phase);

  const bumpCallRevision = React.useCallback(() => {
    setCallRevision((value) => value + 1);
  }, []);

  const clearTimers = React.useCallback(() => {
    for (const timer of [
      ringTimerRef,
      durationTimerRef,
      stillThereTimerRef,
      stillThereCountdownRef,
      endReturnTimerRef,
    ]) {
      if (timer.current) {
        window.clearTimeout(timer.current);
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
    }
  }, []);

  const invalidateOutbound = React.useCallback(() => {
    outboundGenerationRef.current += 1;
  }, []);

  const resetToIdle = React.useCallback(() => {
    invalidateOutbound();
    clearTimers();
    setPhase('idle');
    setActiveCall(null);
    setIncomingInvite(null);
    setIsMinimized(false);
    setStillThereOpen(false);
    setElapsedSeconds(0);
    setEndedMessage(null);
    setIsStarting(false);
    setCalleeAccepted(false);
    segmentStartedAtRef.current = null;
    waitingForAnswerRef.current = false;
    isEndingRef.current = false;
    localHangupRef.current = false;
    setIsEnding(false);
  }, [clearTimers, invalidateOutbound]);

  const showEndedAndClose = React.useCallback(
    (message = 'Call ended. Returning to chat screen.', options?: { playSound?: boolean }) => {
      if (phaseRef.current === 'ended_message') {
        return;
      }

      if (options?.playSound !== false) {
        playCallDisconnected();
      }

      invalidateOutbound();
      clearTimers();
      waitingForAnswerRef.current = false;
      setStillThereOpen(false);
      setIncomingInvite(null);
      setActiveCall(null);
      setCalleeAccepted(false);
      setPhase('ended_message');
      setEndedMessage(message);
      setIsMinimized(false);
      setIsStarting(false);
      isEndingRef.current = false;
      setIsEnding(false);
      bumpCallRevision();

      void leave();

      endReturnTimerRef.current = window.setTimeout(() => {
        resetToIdle();
        bumpCallRevision();
      }, CALL_END_RETURN_MS);
    },
    [bumpCallRevision, clearTimers, invalidateOutbound, leave, resetToIdle],
  );

  const handleRemoteEnd = React.useCallback(
    (payload: CallEventPayload) => {
      if (!payload?.callId || phaseRef.current === 'ended_message') {
        return;
      }

      const current = activeCallRef.current;
      const invite = incomingInviteRef.current;

      if (
        current?.callId !== payload.callId &&
        invite?.callId !== payload.callId
      ) {
        return;
      }

      if (isPendingCallId(current?.callId)) {
        return;
      }

      const message =
        payload.status === 'missed' || payload.status === 'declined'
          ? 'Call missed. Returning to chat screen.'
          : 'Call ended. Returning to chat screen.';

      showEndedAndClose(message);
    },
    [showEndedAndClose],
  );

  const startDurationTracking = React.useCallback(() => {
    segmentStartedAtRef.current = Date.now();
    setElapsedSeconds(0);

    if (durationTimerRef.current) {
      window.clearTimeout(durationTimerRef.current);
    }

    durationTimerRef.current = window.setTimeout(() => {
      setStillThereOpen(true);
      setStillThereSecondsLeft(Math.floor(CALL_STILL_THERE_TIMEOUT_MS / 1000));

      if (stillThereCountdownRef.current) {
        window.clearInterval(stillThereCountdownRef.current);
      }

      stillThereCountdownRef.current = window.setInterval(() => {
        setStillThereSecondsLeft((value) => {
          if (value <= 1) {
            if (stillThereCountdownRef.current) {
              window.clearInterval(stillThereCountdownRef.current);
            }
            return 0;
          }

          return value - 1;
        });
      }, 1000);

      if (stillThereTimerRef.current) {
        window.clearTimeout(stillThereTimerRef.current);
      }

      stillThereTimerRef.current = window.setTimeout(() => {
        void (async () => {
          const current = activeCallRef.current;
          if (!current || isPendingCallId(current.callId)) {
            return;
          }

          try {
            await endChatCall(current.chatId, current.callId);
          } catch {
            // Remote may already have ended the call.
          }

          showEndedAndClose('Call ended due to inactivity.');
        })();
      }, CALL_STILL_THERE_TIMEOUT_MS);
    }, CALL_DURATION_CHECK_MS);
  }, [showEndedAndClose]);

  const beginActiveSegment = React.useCallback(() => {
    setPhase('active');
    startDurationTracking();
  }, [startDurationTracking]);

  const buildOutgoingPreview = React.useCallback(
    (target: CallConfirmTarget): ActiveCallState => ({
      callId: `pending-${Date.now()}`,
      chatId: target.chatId,
      mode: target.mode,
      peerName: target.peerName,
      peerAvatar: target.peerAvatar,
      roomUrl: '',
      token: '',
      role: 'caller',
    }),
    [],
  );

  const startOutgoingCall = React.useCallback(
    async (target: CallConfirmTarget, generation: number) => {
      let createdCall: ActiveCallState | null = null;
      waitingForAnswerRef.current = true;
      clearTimers();
      setIsStarting(true);

      try {
        const response = await createChatCall(target.chatId, target.mode);

        if (generation !== outboundGenerationRef.current) {
          if (response.call.id) {
            void endChatCall(target.chatId, response.call.id).catch(() => undefined);
          }
          return;
        }

        const nextCall: ActiveCallState = {
          callId: response.call.id,
          chatId: target.chatId,
          mode: target.mode,
          peerName: target.peerName,
          peerAvatar: target.peerAvatar,
          roomUrl: response.roomUrl,
          token: response.token,
          role: 'caller',
        };
        createdCall = nextCall;

        setActiveCall(nextCall);
        setPhase('outgoing');
        bumpCallRevision();

        ringTimerRef.current = window.setTimeout(() => {
          void (async () => {
            if (!waitingForAnswerRef.current) {
              return;
            }

            try {
              await markChatCallMissed(nextCall.chatId, nextCall.callId);
            } catch {
              // Ignore if already handled.
            }

            waitingForAnswerRef.current = false;
            showEndedAndClose('No answer. Returning to chat screen.');
          })();
        }, CALL_RING_TIMEOUT_MS);

        void join(nextCall.roomUrl, nextCall.token, nextCall.mode, user?.username).catch(
          (error) => {
            if (generation !== outboundGenerationRef.current) {
              return;
            }

            handleAsyncError(error, {
              title: 'Could not connect to call room',
              context: 'call.join',
            });
          },
        );
      } catch (error) {
        if (generation !== outboundGenerationRef.current) {
          return;
        }

        if (createdCall) {
          try {
            await endChatCall(createdCall.chatId, createdCall.callId);
          } catch {
            // Ignore cleanup failures.
          }
        }

        if (ringTimerRef.current) {
          window.clearTimeout(ringTimerRef.current);
        }

        handleAsyncError(error, {
          title: 'Could not start call',
          context: 'call.create',
        });
        waitingForAnswerRef.current = false;
        resetToIdle();
      } finally {
        if (generation === outboundGenerationRef.current) {
          setIsStarting(false);
        }
      }
    },
    [bumpCallRevision, clearTimers, join, resetToIdle, showEndedAndClose, user?.username],
  );

  const joinRoom = React.useCallback(
    async (call: ActiveCallState) => {
      setPhase('joining');
      await join(call.roomUrl, call.token, call.mode, user?.username);
    },
    [join, user?.username],
  );

  const acceptIncoming = React.useCallback(async () => {
    const invite = incomingInviteRef.current;

    if (!invite || !user || isAccepting) {
      return;
    }

    setIsAccepting(true);
    setPhase('joining');

    if (ringTimerRef.current) {
      window.clearTimeout(ringTimerRef.current);
    }

    try {
      const response = await acceptChatCall(invite.chatId, invite.callId);
      const nextCall: ActiveCallState = {
        callId: invite.callId,
        chatId: invite.chatId,
        mode: invite.mode,
        peerName: invite.initiatorName,
        peerAvatar: invite.initiatorAvatar ?? invite.peerAvatar ?? '',
        roomUrl: response.roomUrl,
        token: response.token,
        role: 'callee',
      };

      setIncomingInvite(null);
      setActiveCall(nextCall);
      waitingForAnswerRef.current = false;
      bumpCallRevision();
      await joinRoom(nextCall);
    } catch (error) {
      const staleCall =
        error instanceof ApiError &&
        (error.status === 409 ||
          error.message.toLowerCase().includes('no longer ringing'));

      if (staleCall) {
        setIncomingInvite(null);
        resetToIdle();
        bumpCallRevision();
        handleAsyncError(error, {
          title: 'Call unavailable',
          fallback: 'This call has already ended.',
          context: 'call.accept',
        });
      } else {
        handleAsyncError(error, {
          title: 'Could not join call',
          context: 'call.accept',
        });
        resetToIdle();
      }
    } finally {
      setIsAccepting(false);
    }
  }, [
    bumpCallRevision,
    isAccepting,
    joinRoom,
    resetToIdle,
    user,
  ]);

  const declineIncoming = React.useCallback(() => {
    const invite = incomingInviteRef.current;

    if (!invite) {
      return;
    }

    setIncomingInvite(null);
    resetToIdle();
    bumpCallRevision();

    void declineChatCall(invite.chatId, invite.callId).catch(() => undefined);
  }, [bumpCallRevision, resetToIdle]);

  const endActiveCall = React.useCallback(() => {
    if (isEndingRef.current || phaseRef.current === 'ended_message') {
      return;
    }

    isEndingRef.current = true;
    localHangupRef.current = true;
    setIsEnding(true);
    waitingForAnswerRef.current = false;
    invalidateOutbound();
    clearTimers();
    setStillThereOpen(false);

    const invite = incomingInviteRef.current;
    const current = activeCallRef.current;

    if (!current) {
      if (invite) {
        playCallDisconnected();
        setIncomingInvite(null);
        resetToIdle();
        void declineChatCall(invite.chatId, invite.callId).catch(() => undefined);
      } else {
        isEndingRef.current = false;
        localHangupRef.current = false;
        setIsEnding(false);
      }

      return;
    }

    const endedCall = current;
    if (isPendingCallId(endedCall.callId)) {
      playCallDisconnected();
      isEndingRef.current = false;
      localHangupRef.current = false;
      setIsEnding(false);
      resetToIdle();
      void leave();
      return;
    }

    broadcastCallEnd(endedCall.chatId, endedCall.callId);
    void endChatCall(endedCall.chatId, endedCall.callId).catch(() => undefined);
    showEndedAndClose('Call ended. Returning to chat screen.', { playSound: true });
  }, [clearTimers, invalidateOutbound, leave, resetToIdle, showEndedAndClose]);

  const continueCall = React.useCallback(() => {
    setStillThereOpen(false);

    if (stillThereTimerRef.current) {
      window.clearTimeout(stillThereTimerRef.current);
    }

    if (stillThereCountdownRef.current) {
      window.clearInterval(stillThereCountdownRef.current);
    }

    startDurationTracking();
  }, [startDurationTracking]);

  React.useEffect(() => {
    if (phase !== 'active' && phase !== 'still_there') {
      return;
    }

    const interval = window.setInterval(() => {
      if (!segmentStartedAtRef.current) {
        return;
      }

      setElapsedSeconds(
        Math.floor((Date.now() - segmentStartedAtRef.current) / 1000),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  React.useEffect(() => {
    const userId = user?.id;

    const onInvite = (payload: CallInvitePayload) => {
      if (!payload?.callId || payload.initiatorId === userId) {
        return;
      }

      if (incomingInviteRef.current?.callId === payload.callId) {
        return;
      }

      const current = activeCallRef.current;
      const currentPhase = phaseRef.current;

      if (
        current &&
        (currentPhase === 'active' ||
          currentPhase === 'still_there' ||
          currentPhase === 'joining')
      ) {
        return;
      }

      if (current && currentPhase === 'outgoing' && !isPendingCallId(current.callId)) {
        return;
      }

      if (current && (currentPhase === 'confirm' || currentPhase === 'outgoing')) {
        invalidateOutbound();
        clearTimers();
        waitingForAnswerRef.current = false;
        void leave();
      }

      setActiveCall(null);
      setIncomingInvite({ ...payload, role: 'callee' });
      setPhase('incoming');
      setIsMinimized(false);
      setIsStarting(false);
      primeCallSounds();
    };

    const onAccept = (payload: CallEventPayload) => {
      if (!payload?.callId || !userId) {
        return;
      }

      if (payload.initiatorId === userId && waitingForAnswerRef.current) {
        waitingForAnswerRef.current = false;

        if (ringTimerRef.current) {
          window.clearTimeout(ringTimerRef.current);
        }

        setCalleeAccepted(true);
      }

      bumpCallRevision();
    };

    const onEnd = (payload: CallEventPayload) => {
      handleRemoteEnd(payload);
    };

    return registerInboxCallListener((event: InboxCallEvent, payload: unknown) => {
      switch (event) {
        case 'call_invite':
          onInvite(payload as CallInvitePayload);
          break;
        case 'call_accept':
          onAccept(payload as CallEventPayload);
          break;
        case 'call_decline':
        case 'call_end':
        case 'call_missed':
          onEnd(payload as CallEventPayload);
          break;
        default:
          break;
      }
    });
  }, [
    bumpCallRevision,
    clearTimers,
    handleRemoteEnd,
    invalidateOutbound,
    leave,
    user?.id,
  ]);

  React.useEffect(() => {
    setCallEventHandlers({
      onRemoteParticipantLeft: () => {
        if (localHangupRef.current || phaseRef.current === 'ended_message') {
          return;
        }

        const currentPhase = phaseRef.current;
        if (
          currentPhase === 'idle' ||
          currentPhase === 'incoming' ||
          currentPhase === 'confirm'
        ) {
          return;
        }

        if (
          currentPhase === 'outgoing' &&
          isPendingCallId(activeCallRef.current?.callId)
        ) {
          return;
        }

        showEndedAndClose();
      },
    });
  }, [setCallEventHandlers, showEndedAndClose]);

  React.useEffect(() => {
    if (!isJoined || !isRemoteAudioReady) {
      return;
    }

    const currentPhase = phaseRef.current;
    if (currentPhase === 'outgoing' || currentPhase === 'joining') {
      setCalleeAccepted(false);
      beginActiveSegment();
    }
  }, [beginActiveSegment, isJoined, isRemoteAudioReady]);

  React.useEffect(() => {
    return () => {
      clearTimers();
      void leave();
    };
  }, [clearTimers, leave]);

  const requestCall = React.useCallback(
    (target: CallConfirmTarget) => {
      if (phaseRef.current === 'ended_message') {
        resetToIdle();
      }

      if (incomingInviteRef.current) {
        return;
      }

      const current = activeCallRef.current;
      const currentPhase = phaseRef.current;
      if (
        current &&
        currentPhase !== 'idle' &&
        !(currentPhase === 'outgoing' && isPendingCallId(current.callId))
      ) {
        return;
      }

      const generation = outboundGenerationRef.current + 1;
      outboundGenerationRef.current = generation;

      primeCallSounds();
      clearTimers();
      isEndingRef.current = false;
      setIsEnding(false);
      setIncomingInvite(null);
      setActiveCall(buildOutgoingPreview(target));
      setPhase('outgoing');
      setIsMinimized(false);

      void startOutgoingCall(target, generation);
    },
    [buildOutgoingPreview, clearTimers, resetToIdle, startOutgoingCall],
  );

  const contextValue = React.useMemo<CallContextValue>(
    () => ({
      requestCall,
      activeCallChatId: activeCall?.chatId ?? incomingInvite?.chatId ?? null,
      liveCallId:
        activeCall?.callId && !isPendingCallId(activeCall.callId)
          ? activeCall.callId
          : null,
      callRevision,
    }),
    [activeCall, callRevision, incomingInvite, requestCall],
  );

  return (
    <CallContext.Provider value={contextValue}>
      {children}

      <CallStillThereDialog
        open={stillThereOpen}
        secondsRemaining={stillThereSecondsLeft}
        onContinue={continueCall}
        onEnd={() => {
          setStillThereOpen(false);
          endActiveCall();
        }}
      />

      <CallWindow
        phase={phase}
        activeCall={activeCall}
        incomingInvite={
          incomingInvite
            ? {
                peerName: incomingInvite.initiatorName,
                peerAvatar:
                  incomingInvite.initiatorAvatar ?? incomingInvite.peerAvatar ?? '',
                mode: incomingInvite.mode,
              }
            : null
        }
        localAvatar={user?.profileUrl ?? ''}
        localName={user?.username ?? 'You'}
        isMinimized={isMinimized}
        elapsedSeconds={elapsedSeconds}
        endedMessage={endedMessage}
        isJoined={isJoined}
        isMuted={isMuted}
        isStarting={isStarting}
        onToggleMute={() => void toggleMute()}
        onMinimize={() => setIsMinimized(true)}
        onMaximize={() => setIsMinimized(false)}
        onClose={() => {
          if (phase === 'ended_message') {
            resetToIdle();
            return;
          }

          endActiveCall();
        }}
        onEndCall={endActiveCall}
        onAcceptIncoming={() => void acceptIncoming()}
        onDeclineIncoming={declineIncoming}
        isAccepting={isAccepting}
        isEnding={isEnding}
        calleeAccepted={calleeAccepted}
        isAwaitingMedia={
          isJoined &&
          !isRemoteAudioReady &&
          (phase === 'joining' || (phase === 'outgoing' && calleeAccepted))
        }
      />
    </CallContext.Provider>
  );
}
