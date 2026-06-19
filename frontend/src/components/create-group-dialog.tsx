'use client';

import * as React from 'react';
import { Camera, Globe, Loader2, Lock, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createGroup, uploadGroupImage, type Group } from '@/lib/database';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';

type CreateGroupDialogProps = {
  onCreated: (group: Group) => void;
};

export function CreateGroupDialog({ onCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(true);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [pendingImage, setPendingImage] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags('');
    setIsPublic(true);
    setImagePreview(null);
    setPendingImage(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPendingImage(file);
    setImagePreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (name.trim().length < 2) return;
    if (description.trim().length < 10) return;

    setIsSubmitting(true);
    try {
      const tagList = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      let group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        tags: tagList.length > 0 ? tagList : undefined,
        isPublic,
      });

      if (pendingImage) {
        group = await uploadGroupImage(group.id, pendingImage);
      }

      onCreated(group);
      showSuccessToast('Group created', `"${group.name}" is ready for members.`);
      setOpen(false);
      resetForm();
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not create group',
        context: 'groups.create',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0">
          <PlusCircle className="mr-2 size-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
          <DialogDescription>
            Start a community and invite others to build habits together.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                imagePreview ??
                `https://placehold.co/600x240/9333ea/ffffff?text=${encodeURIComponent(name.trim() || 'New Group')}`
              }
              alt="Group cover preview"
              className="h-32 w-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute bottom-3 right-3 gap-2 shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <Camera className="size-4" />
              Add cover
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
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Runners"
              disabled={isSubmitting}
              minLength={2}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              disabled={isSubmitting}
              rows={4}
              minLength={10}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-tags">Tags (optional)</Label>
            <Input
              id="group-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="fitness, morning, accountability"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
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
                  ? 'Visible in Discover Groups. Anyone can join.'
                  : 'Hidden from discovery. Share an invite link to add members.'}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isSubmitting}
              aria-label="Toggle group visibility"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                isSubmitting || name.trim().length < 2 || description.trim().length < 10
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
