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

type CallStillThereDialogProps = {
  open: boolean;
  onContinue: () => void;
  onEnd: () => void;
  secondsRemaining: number;
};

export function CallStillThereDialog({
  open,
  onContinue,
  onEnd,
  secondsRemaining,
}: CallStillThereDialogProps) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you still in the call?</AlertDialogTitle>
          <AlertDialogDescription>
            This call has been running for a while. Tap continue to stay connected,
            or end the call. It will automatically end in{' '}
            {minutes}:{seconds.toString().padStart(2, '0')}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onEnd}>End call</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Yes, continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
