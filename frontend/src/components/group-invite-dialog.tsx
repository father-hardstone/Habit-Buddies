'use client';

import * as React from 'react';
import { Check, Copy, Globe, Link2, Loader2, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getGroupInviteLink } from '@/lib/database';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';

type GroupInviteDialogProps = {
  groupId: string;
  groupName: string;
  isPublic: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GroupInviteDialog({
  groupId,
  groupName,
  isPublic,
  open,
  onOpenChange,
}: GroupInviteDialogProps) {
  const [inviteUrl, setInviteUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }

    setIsLoading(true);
    getGroupInviteLink(groupId)
      .then((data) => setInviteUrl(data.inviteUrl))
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load invite link',
          context: 'groups.invite',
        });
        onOpenChange(false);
      })
      .finally(() => setIsLoading(false));
  }, [open, groupId, onOpenChange]);

  const handleCopy = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      showSuccessToast('Link copied', 'Invite link copied to clipboard.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      handleAsyncError(new Error('Could not copy link'), {
        title: 'Copy failed',
        context: 'groups.invite.copy',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            Invite to {groupName}
          </DialogTitle>
          <DialogDescription>
            {isPublic ? (
              <>
                This group is <strong>public</strong> — people can also find it under
                Discover Groups. Share this link for a direct invite.
              </>
            ) : (
              <>
                This group is <strong>private</strong> — it won&apos;t appear in Discover
                Groups. Share this invite link so people can join.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              isPublic
                ? 'border-primary/20 bg-primary/5 text-primary'
                : 'border-muted bg-muted/40 text-muted-foreground'
            }`}
          >
            {isPublic ? <Globe className="size-4 shrink-0" /> : <Lock className="size-4 shrink-0" />}
            {isPublic ? 'Public — discoverable in Groups tab' : 'Private — invite link only'}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    readOnly
                    value={inviteUrl}
                    className="pl-9 font-mono text-xs"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 gap-2"
                  onClick={() => void handleCopy()}
                  disabled={!inviteUrl}
                >
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can join while logged in.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GroupInviteTrigger({
  groupId,
  groupName,
  isPublic,
  variant = 'icon',
}: {
  groupId: string;
  groupName: string;
  isPublic: boolean;
  variant?: 'icon' | 'button';
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {variant === 'button' ? (
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setOpen(true)}
        >
          <UserPlus className="size-4" />
          Invite
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-primary"
          onClick={() => setOpen(true)}
        >
          <UserPlus className="size-4" />
          <span className="sr-only">Invite people</span>
        </Button>
      )}
      <GroupInviteDialog
        groupId={groupId}
        groupName={groupName}
        isPublic={isPublic}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
