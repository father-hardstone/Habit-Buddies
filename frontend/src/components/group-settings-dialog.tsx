'use client';

import * as React from 'react';
import { Camera, Copy, Globe, Loader2, Lock, Settings, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { updateGroup, uploadGroupImage, getGroupInviteLink, type Group } from '@/lib/database';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';

type GroupSettingsDialogProps = {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (group: Group) => void;
};

export function GroupSettingsDialog({
  group,
  open,
  onOpenChange,
  onUpdated,
}: GroupSettingsDialogProps) {
  const [name, setName] = React.useState(group.name);
  const [description, setDescription] = React.useState(group.description);
  const [tags, setTags] = React.useState(group.tags.join(', '));
  const [isPublic, setIsPublic] = React.useState(group.isPublic);
  const [imagePreview, setImagePreview] = React.useState(group.image);
  const [pendingImage, setPendingImage] = React.useState<File | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [inviteUrl, setInviteUrl] = React.useState('');
  const [isLoadingInvite, setIsLoadingInvite] = React.useState(false);
  const [copiedInvite, setCopiedInvite] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setCopiedInvite(false);
      return;
    }

    setIsLoadingInvite(true);
    getGroupInviteLink(group.id)
      .then((data) => setInviteUrl(data.inviteUrl))
      .catch(() => setInviteUrl(''))
      .finally(() => setIsLoadingInvite(false));
  }, [open, group.id]);

  React.useEffect(() => {
    if (open) {
      setName(group.name);
      setDescription(group.description);
      setTags(group.tags.join(', '));
      setIsPublic(group.isPublic);
      setImagePreview(group.image);
      setPendingImage(null);
    }
  }, [open, group]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPendingImage(file);
    setImagePreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || description.trim().length < 10) return;

    setIsSaving(true);
    try {
      let updated = group;

      if (pendingImage) {
        updated = await uploadGroupImage(group.id, pendingImage);
      }

      const tagList = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      updated = await updateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
        tags: tagList,
        isPublic,
      });

      onUpdated(updated);
      showSuccessToast('Group updated', `"${updated.name}" settings saved.`);
      onOpenChange(false);
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not save group settings',
        context: 'groups.settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      showSuccessToast('Link copied', 'Invite link copied to clipboard.');
      window.setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      handleAsyncError(new Error('Could not copy link'), {
        title: 'Copy failed',
        context: 'groups.invite.copy',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            Group settings
          </DialogTitle>
          <DialogDescription>
            Manage visibility, cover image, and details for your group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
          <div className="relative overflow-hidden rounded-xl border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                imagePreview?.startsWith('http') || imagePreview?.startsWith('blob:')
                  ? imagePreview
                  : `https://placehold.co/600x240/9333ea/ffffff?text=${encodeURIComponent(name.slice(0, 18))}`
              }
              alt={name}
              className="h-36 w-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute bottom-3 right-3 gap-2 shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
            >
              <Camera className="size-4" />
              Change cover
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-group-name">Group name</Label>
            <Input
              id="settings-group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              minLength={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-group-description">Description</Label>
            <Textarea
              id="settings-group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
              minLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-group-tags">Tags</Label>
            <Input
              id="settings-group-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="fitness, morning, accountability"
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2 font-medium">
                {isPublic ? (
                  <Globe className="size-4 text-primary" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}
                {isPublic ? 'Public group' : 'Private group'}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Anyone can discover and join this group.'
                  : 'Hidden from discovery. Only members with an invite link can join.'}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isSaving}
              aria-label="Toggle group visibility"
            />
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center gap-2 font-medium">
              <UserPlus className="size-4 text-primary" />
              Invite people
            </div>
            <p className="text-sm text-muted-foreground">
              {isPublic
                ? 'Share this link or let people find the group under Discover Groups.'
                : 'Private groups can only be joined via this invite link.'}
            </p>
            {isLoadingInvite ? (
              <div className="flex justify-center py-3">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex gap-2">
                <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void handleCopyInvite()}
                  disabled={!inviteUrl}
                >
                  <Copy className="size-4" />
                  <span className="sr-only">{copiedInvite ? 'Copied' : 'Copy invite link'}</span>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving || name.trim().length < 2 || description.trim().length < 10
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save settings'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GroupSettingsTrigger({
  group,
  onUpdated,
}: {
  group: Group;
  onUpdated: (group: Group) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Settings className="size-4" />
        <span className="sr-only">Group settings</span>
      </Button>
      <GroupSettingsDialog
        group={group}
        open={open}
        onOpenChange={setOpen}
        onUpdated={onUpdated}
      />
    </>
  );
}
