'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AvatarViewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  name: string;
};

export function AvatarViewModal({
  open,
  onOpenChange,
  imageUrl,
  name,
}: AvatarViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,420px)] gap-4 border-none bg-transparent p-0 shadow-none sm:max-w-[420px] [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100">
        <DialogHeader className="sr-only">
          <DialogTitle>{name}&apos;s profile photo</DialogTitle>
          <DialogDescription>View profile photo</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div className="overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${name}'s profile photo`}
              className="aspect-square max-h-[min(70vh,420px)] w-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-white drop-shadow-md">{name}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
