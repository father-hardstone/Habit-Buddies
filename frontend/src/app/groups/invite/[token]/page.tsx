import { InviteJoinPage } from './invite-join-content';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function GroupInvitePage({ params }: PageProps) {
  const { token } = await params;
  return <InviteJoinPage token={token} />;
}
