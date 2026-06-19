'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, Loader2, Lock, Users } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import {
  InviteAuthPanel,
  InvitePageLayout,
} from '@/components/invite/invite-page-layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  getInvitePreview,
  getPublicInvitePreview,
  joinGroupByInvite,
  type Group,
} from '@/lib/database';
import { ApiError } from '@/lib/api-client';
import { handleAsyncError, showSuccessToast } from '@/lib/error-utils';

type InviteJoinPageProps = {
  token: string;
};

function MobileGroupBanner({ group }: { group: Group }) {
  return (
    <div className="border-b bg-gradient-to-br from-primary/10 to-accent/10 p-4 lg:hidden">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            group.image?.startsWith('http')
              ? group.image
              : `https://placehold.co/640x160/9333ea/ffffff?text=${encodeURIComponent(group.name.slice(0, 18))}`
          }
          alt=""
          className="h-28 w-full object-cover"
        />
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-bold font-headline">{group.name}</h2>
            {group.isPublic ? (
              <Globe className="size-4 shrink-0 text-primary" />
            ) : (
              <Lock className="size-4 shrink-0 text-muted-foreground" />
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {group.members} members · by {group.creatorName}
          </p>
        </div>
      </div>
    </div>
  );
}

export function InviteJoinPage({ token }: InviteJoinPageProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [previewGroup, setPreviewGroup] = React.useState<Group | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isJoining, setIsJoining] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>('login');
  const joinStartedRef = React.useRef(false);

  React.useEffect(() => {
    setIsLoading(true);
    setLoadError(false);

    getPublicInvitePreview(token)
      .then((data) => setPreviewGroup(data.group))
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [token]);

  const completeInviteJoin = React.useCallback(async () => {
    if (joinStartedRef.current) return;
    joinStartedRef.current = true;
    setIsJoining(true);

    try {
      let groupId = previewGroup?.id;

      if (user) {
        const preview = await getInvitePreview(token);
        if (preview.group.isJoined) {
          router.replace(`/?group=${preview.group.id}`);
          return;
        }
      }

      const group = await joinGroupByInvite(token);
      groupId = group.id;
      showSuccessToast('Joined group', `Welcome to ${group.name}!`);
      router.replace(`/?group=${groupId}`);
    } catch (error) {
      joinStartedRef.current = false;
      if (error instanceof ApiError && error.status === 409) {
        const preview = await getInvitePreview(token).catch(() => null);
        if (preview?.group.id) {
          router.replace(`/?group=${preview.group.id}`);
          return;
        }
      }
      handleAsyncError(error, {
        title: 'Could not join group',
        context: 'groups.invite.join',
      });
    } finally {
      setIsJoining(false);
    }
  }, [previewGroup?.id, router, token, user]);

  React.useEffect(() => {
    if (authLoading || !user || !previewGroup || isJoining) return;
    void completeInviteJoin();
  }, [authLoading, user, previewGroup, isJoining, completeInviteJoin]);

  const handleAuthSuccess = async () => {
    await completeInviteJoin();
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !previewGroup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold font-headline">Invite not found</h1>
          <p className="text-muted-foreground">
            This link may be invalid. Ask the group owner for a new one.
          </p>
          <Button asChild variant="outline">
            <Link href="/welcome">Go to Habit Buddies</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <InvitePageLayout
        group={previewGroup}
        mobileGroupSummary={<MobileGroupBanner group={previewGroup} />}
      >
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 lg:min-h-screen">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Joining {previewGroup.name}…</p>
        </div>
      </InvitePageLayout>
    );
  }

  return (
    <InvitePageLayout
      group={previewGroup}
      mobileGroupSummary={<MobileGroupBanner group={previewGroup} />}
    >
      <InviteAuthPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title={activeTab === 'login' ? 'Welcome back' : 'Create your account'}
        subtitle={
          activeTab === 'login'
            ? `Log in to join ${previewGroup.name}.`
            : `Sign up to join ${previewGroup.name} and start tracking habits.`
        }
      >
        {activeTab === 'login' ? (
          <LoginForm
            options={{ skipRedirect: true }}
            onSuccess={handleAuthSuccess}
            showSignupLink={false}
          />
        ) : (
          <SignupForm
            options={{ skipRedirect: true }}
            onSuccess={handleAuthSuccess}
            showLoginLink={false}
            showDemoTip={false}
          />
        )}
      </InviteAuthPanel>
    </InvitePageLayout>
  );
}
