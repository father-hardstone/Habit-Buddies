
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Crown, Globe, Loader2, Lock, Mail, Users } from 'lucide-react';
import { getJoinedGroups, type Group } from '@/lib/database';
import { useAuth } from '@/hooks/use-auth';
import { AppPageHeader } from '@/components/app-page-header';
import { AppPageShell } from '@/components/app-page-shell';
import { GroupInviteTrigger } from '@/components/group-invite-dialog';
import { GroupSettingsTrigger } from '@/components/group-settings-dialog';
import { ProfilePageContentSkeleton } from '@/components/ui/skeleton-loaders';
import { ImageUploadCropModal } from '@/components/image-upload-crop-modal';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';
import { updateProfileRequest, uploadAvatarRequest } from '@/lib/auth-api';
import Link from 'next/link';
import * as React from 'react';

function getGroupImageUrl(group: Group) {
  if (group.image?.startsWith('http')) {
    return group.image;
  }

  return `https://placehold.co/96x96/9333ea/ffffff?text=${encodeURIComponent(group.name.slice(0, 2))}`;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [joinedGroups, setJoinedGroups] = React.useState<Group[]>([]);
  const [name, setName] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setName(user.username);
    setAvatarPreview(user.profileUrl);
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getJoinedGroups()
      .then(setJoinedGroups)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load profile',
          context: 'profile.page',
        });
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || name.trim().length < 2) return;

    setIsSaving(true);
    try {
      const { user: updated } = await updateProfileRequest(name.trim());
      updateUser({
        ...user,
        username: updated.name,
        name: updated.name,
        profileUrl: updated.avatarUrl ?? user.profileUrl,
      });
      showSuccessToast('Profile updated', 'Your display name has been saved.');
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not save profile',
        context: 'profile.save',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    setIsUploadingAvatar(true);

    try {
      const { user: updated } = await uploadAvatarRequest(file);
      const profileUrl = updated.avatarUrl ?? user.profileUrl;
      updateUser({
        ...user,
        avatarUrl: updated.avatarUrl,
        profileUrl,
      });
      setAvatarPreview(profileUrl);
      showSuccessToast('Photo updated', 'Your profile picture has been changed.');
    } catch (error) {
      handleAsyncError(error, {
        title: 'Could not upload photo',
        context: 'profile.avatar',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGroupUpdated = (updated: Group) => {
    setJoinedGroups((current) =>
      current.map((group) => (group.id === updated.id ? updated : group)),
    );
  };

  const hasNameChanges = user ? name.trim() !== user.username : false;

  return (
    <AppPageShell>
      <AppPageHeader
        title="My Profile"
        description="Manage your account and group memberships."
      >
        <Button
          disabled={isLoading || isSaving || !hasNameChanges || name.trim().length < 2}
          onClick={() => void handleSaveProfile()}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </AppPageHeader>

      {isLoading ? (
        <ProfilePageContentSkeleton />
      ) : (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-3">
              <Card className="overflow-hidden border shadow-sm">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                <CardHeader className="relative pb-2 pt-0">
                  <div className="-mt-14">
                    <div className="relative inline-block">
                      <Avatar className="size-24 border-4 border-background shadow-lg ring-2 ring-primary/20">
                        <AvatarImage src={avatarPreview} data-ai-hint="user avatar" />
                        <AvatarFallback className="text-2xl">
                          {user!.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                          <Loader2 className="size-6 animate-spin text-primary" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute -bottom-1 -right-1 size-8 rounded-full border-2 border-background shadow-md"
                        onClick={() => setIsCropModalOpen(true)}
                        disabled={isUploadingAvatar}
                      >
                        <Camera className="size-4" />
                        <span className="sr-only">Change photo</span>
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-2xl">{user!.username}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="size-4" />
                    {user!.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Shown on leaderboards and in group chats.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user!.email}
                        readOnly
                        disabled
                        className="bg-muted/50 text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed from settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="flex h-full flex-col overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    My groups
                  </CardTitle>
                  <CardDescription>
                    {joinedGroups.length === 0
                      ? 'Join or create a group to get started.'
                      : `${joinedGroups.length} group${joinedGroups.length === 1 ? '' : 's'} joined`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
                  <div className="space-y-2">
                    {joinedGroups.map((group) => {
                      const isOwner = group.adminId === user!.id;

                      return (
                        <div
                          key={group.id}
                          className="grid min-h-[4.75rem] grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/25 hover:bg-muted/30"
                        >
                          <div className="size-14 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getGroupImageUrl(group)}
                              alt=""
                              className="size-full object-cover"
                              data-ai-hint={group.aiHint}
                            />
                          </div>

                          <div className="min-w-0 space-y-1.5">
                            <Link
                              href="/"
                              className="block truncate text-sm font-semibold leading-tight hover:text-primary hover:underline"
                            >
                              {group.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isOwner && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 shrink-0 gap-1 px-1.5 text-[10px] font-medium"
                                >
                                  <Crown className="size-3" />
                                  Owner
                                </Badge>
                              )}
                              <span className="inline-flex h-5 items-center gap-1 rounded-md bg-muted/60 px-1.5 text-[10px] font-medium text-muted-foreground">
                                <Users className="size-3 shrink-0" />
                                {group.members}
                              </span>
                              <span
                                className={`inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium ${
                                  group.isPublic
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted/60 text-muted-foreground'
                                }`}
                              >
                                {group.isPublic ? (
                                  <Globe className="size-3 shrink-0" />
                                ) : (
                                  <Lock className="size-3 shrink-0" />
                                )}
                                {group.isPublic ? 'Public' : 'Private'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-self-end">
                            {isOwner && (
                              <>
                                <GroupInviteTrigger
                                  groupId={group.id}
                                  groupName={group.name}
                                  isPublic={group.isPublic}
                                />
                                <GroupSettingsTrigger
                                  group={group}
                                  onUpdated={handleGroupUpdated}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {joinedGroups.length === 0 && (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                      <Users className="mx-auto mb-3 size-8 text-muted-foreground/60" />
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t joined any groups yet.
                      </p>
                      <Button asChild variant="link" className="mt-2">
                        <Link href="/groups">Discover groups</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}

      <ImageUploadCropModal
        open={isCropModalOpen}
        onOpenChange={setIsCropModalOpen}
        onConfirm={handleAvatarUpload}
        isUploading={isUploadingAvatar}
        title="Profile photo"
        description="Crop your photo to a square. Drag to reposition and zoom as needed."
        confirmLabel="Save photo"
      />
    </AppPageShell>
  );
}
