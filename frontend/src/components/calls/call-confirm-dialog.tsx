'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CallConfirmTarget } from '@/lib/call-constants';

type CallConfirmDialogProps = {
  target: CallConfirmTarget | null;
  onConfirm: () => void;
  onCancel: () => void;
  isStarting?: boolean;
};

export function CallConfirmDialog({
  target,
  onConfirm,
  onCancel,
  isStarting = false,
}: CallConfirmDialogProps) {
  const modeLabel = target?.mode === 'video' ? 'video call' : 'voice call';

  return (
    <AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Start a {modeLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {target
              ? `You are about to start a ${modeLabel} with ${target.peerName}. They will receive a ring notification.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isStarting} onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={isStarting} onClick={onConfirm}>
            {isStarting ? 'Starting…' : 'Start call'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
