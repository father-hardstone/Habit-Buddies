import type { CallMode, CallStatus } from './entities/call-session.entity';

export function formatCallDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || totalSeconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function buildCallMessagePreview(
  mode: CallMode,
  status: CallStatus,
  durationSeconds: number | null,
): string {
  const label = mode === 'video' ? 'Video call' : 'Voice call';

  if (status === 'missed' || status === 'declined') {
    return `Missed ${label.toLowerCase()}`;
  }

  if (status === 'ended') {
    return `${label} · ${formatCallDuration(durationSeconds)}`;
  }

  return label;
}
