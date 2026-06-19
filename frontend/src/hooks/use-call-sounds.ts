'use client';

import * as React from 'react';
import type { CallPhase } from '@/lib/call-constants';

type SoundMode = 'incoming' | 'outgoing';

class CallSoundEngine {
  private context: AudioContext | null = null;
  private mode: SoundMode | null = null;
  private timers: number[] = [];
  private oscillators = new Set<OscillatorNode>();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.context) {
      this.context = new AudioContext();
    }

    return this.context;
  }

  async resume(): Promise<void> {
    const context = this.getContext();
    if (context?.state === 'suspended') {
      await context.resume();
    }
  }

  private clearTimers() {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
    this.timers = [];
  }

  private stopOscillators() {
    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop();
      } catch {
        // Already stopped.
      }
      oscillator.disconnect();
    }
    this.oscillators.clear();
  }

  private playBurst(
    frequencies: number[],
    durationMs: number,
    volume = 0.14,
    type: OscillatorType = 'sine',
  ) {
    const context = this.getContext();
    if (!context) {
      return;
    }

    const gain = context.createGain();
    gain.connect(context.destination);

    const start = context.currentTime;
    const durationSec = durationMs / 1000;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

    const created: OscillatorNode[] = [];
    for (const frequency of frequencies) {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(start);
      oscillator.stop(start + durationSec);
      created.push(oscillator);
      this.oscillators.add(oscillator);
    }

    window.setTimeout(() => {
      gain.disconnect();
      for (const oscillator of created) {
        this.oscillators.delete(oscillator);
      }
    }, durationMs + 30);
  }

  startIncoming() {
    if (this.mode === 'incoming') {
      return;
    }

    this.stop();
    this.mode = 'incoming';

    const ring = () => {
      this.playBurst([660, 880, 1100], 520, 0.16, 'triangle');
      this.timers.push(
        window.setTimeout(() => {
          this.playBurst([740, 988], 380, 0.13, 'triangle');
        }, 560),
      );
    };

    ring();
    this.timers.push(window.setInterval(ring, 2800));
  }

  startOutgoing() {
    if (this.mode === 'outgoing') {
      return;
    }

    this.stop();
    this.mode = 'outgoing';

    const ringback = () => {
      this.playBurst([440, 480], 1800, 0.11, 'sine');
    };

    ringback();
    this.timers.push(window.setInterval(ringback, 5200));
  }

  playDisconnected() {
    this.stop();
    void this.resume();
    this.playBurst([480, 380], 180, 0.12, 'sine');
    this.timers.push(
      window.setTimeout(() => {
        this.playBurst([320, 240], 260, 0.1, 'sine');
      }, 200),
    );
  }

  stop() {
    this.mode = null;
    this.clearTimers();
    this.stopOscillators();
  }
}

const callSoundEngine = new CallSoundEngine();

export function primeCallSounds() {
  void callSoundEngine.resume();
}

export function playCallDisconnected() {
  callSoundEngine.playDisconnected();
}

export function useCallSounds(phase: CallPhase) {
  React.useEffect(() => {
    if (phase === 'incoming') {
      void callSoundEngine.resume();
      callSoundEngine.startIncoming();
      return () => callSoundEngine.stop();
    }

    if (phase === 'outgoing' || phase === 'starting' || phase === 'joining') {
      void callSoundEngine.resume();
      callSoundEngine.startOutgoing();
      return () => callSoundEngine.stop();
    }

    callSoundEngine.stop();
    return () => callSoundEngine.stop();
  }, [phase]);
}
