import { apiFetch, apiUpload, publicFetch } from './api-client';

export type Group = {
  id: string;
  name: string;
  description: string;
  image: string;
  aiHint: string;
  tags: string[];
  adminId: string;
  creatorName: string;
  members: number;
  isJoined: boolean;
  isPublic: boolean;
};

export type GroupWithMembers = Omit<Group, 'members'> & {
  members: {
    userId: string;
    score: number;
    rank: number;
    change: 'up' | 'down';
    online: boolean;
    name: string;
    avatar: string;
    isAdmin: boolean;
  }[];
  habits: Habit[];
};

export type Habit = {
  id: string;
  name: string;
  goal: number;
  completed: number;
  streak: number;
  weeklyPoints?: number;
  color: string;
  icon?: string;
  allowMultipleLogsPerDay?: boolean;
  dailyLogLimit?: number;
  pointsPerLog?: number;
  canLog?: boolean;
  history?: { date: string; completed: number }[];
};

export type HabitInput = Omit<Habit, 'id' | 'completed' | 'streak' | 'weeklyPoints' | 'canLog' | 'pointsPerLog'> & {
  id?: string;
  completed?: number;
  streak?: number;
};

export type GroupAnalytics = {
  personalHabits: { id: string; name: string; color: string; icon?: string }[];
  personalDaily: Record<string, string | number>[];
  groupDaily: Record<string, string | number>[];
  users: { userId: string; name: string; color: string }[];
  streakProgress: {
    id: string;
    name: string;
    color: string;
    goal: number;
    completed: number;
    streak: number;
    progress: number;
    targetReached: boolean;
  }[];
  scoreComposition: {
    id: string;
    name: string;
    color: string;
    points: number;
  }[];
};

export type Chat = {
  id: string;
  name: string;
  avatar: string;
  aiHint: string;
  latestMessage: string;
  lastMessageSenderId?: string | null;
  lastMessageStatus?: MessageStatus | null;
  timestamp: string;
  formattedTimestamp: string;
  unreadCount: number;
  online: boolean;
  groupName: string;
};

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';

export type MessageReplyTo = {
  id: string;
  text: string;
  senderId: string;
  sender: 'me' | 'other';
};

export type ChatMessage = {
  id: string;
  sender: 'me' | 'other';
  senderId: string;
  text: string;
  createdAt: string;
  pending?: boolean;
  status?: MessageStatus;
  replyTo?: MessageReplyTo;
};

export type DetailedChat = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  groupName: string;
  peerLastReadAt?: string | null;
  messages: ChatMessage[];
};

export function getAllGroups() {
  return apiFetch<Group[]>('/data/groups');
}

export function createGroup(payload: {
  name: string;
  description: string;
  tags?: string[];
  imageUrl?: string;
  aiHint?: string;
  isPublic?: boolean;
}) {
  return apiFetch<Group>('/data/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateGroup(
  groupId: string,
  payload: {
    name?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  },
) {
  return apiFetch<Group>(`/data/groups/${groupId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function uploadGroupImage(groupId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<Group>(`/data/groups/${groupId}/image`, formData);
}

export function joinGroup(groupId: string) {
  return apiFetch<Group>(`/data/groups/${groupId}/join`, {
    method: 'POST',
  });
}

export type GroupInviteLink = {
  inviteToken: string;
  inviteUrl: string;
  isPublic: boolean;
  groupName: string;
};

export type GroupInvitePreview = {
  group: Group;
  inviteUrl: string;
};

export function getGroupInviteLink(groupId: string) {
  return apiFetch<GroupInviteLink>(`/data/groups/${groupId}/invite`);
}

export function getPublicInvitePreview(token: string) {
  return publicFetch<GroupInvitePreview>(`/invite/${token}`);
}

export function getInvitePreview(token: string) {
  return apiFetch<GroupInvitePreview>(`/data/groups/invite/${token}`);
}

export function joinGroupByInvite(token: string) {
  return apiFetch<Group>(`/data/groups/invite/${token}/join`, {
    method: 'POST',
  });
}

export function getJoinedGroups() {
  return apiFetch<Group[]>('/data/groups/joined');
}

export function getGroupById(id: string) {
  return apiFetch<GroupWithMembers | null>(`/data/groups/${id}`);
}

export function getHabitsForGroup(groupId: string) {
  return apiFetch<Habit[]>(`/data/groups/${groupId}/habits`);
}

export function getGroupAnalytics(groupId: string) {
  return apiFetch<GroupAnalytics>(`/data/groups/${groupId}/analytics`);
}

export function completeHabit(groupId: string, habitId: string) {
  return apiFetch<Habit>(`/data/groups/${groupId}/habits/${habitId}/complete`, {
    method: 'POST',
  });
}

export function updateGroupHabits(groupId: string, habits: HabitInput[]) {
  return apiFetch<Habit[]>(`/data/groups/${groupId}/habits`, {
    method: 'PUT',
    body: JSON.stringify({ habits }),
  });
}

export function getChatsForUser() {
  return apiFetch<Chat[]>('/data/chats');
}

export function createDirectChat(userId: string, groupId?: string) {
  return apiFetch<{ chatId: string; created: boolean }>('/data/chats/direct', {
    method: 'POST',
    body: JSON.stringify({ userId, groupId }),
  });
}

export type ChatMessagesPage = {
  messages: ChatMessage[];
  hasMore: boolean;
};

export function getChatById(chatId: string) {
  return apiFetch<DetailedChat | null>(`/data/chats/${chatId}`);
}

export function getChatMessages(
  chatId: string,
  options: { limit?: number; before?: string } = {},
) {
  const params = new URLSearchParams();
  if (options.limit != null) {
    params.set('limit', String(options.limit));
  }
  if (options.before) {
    params.set('before', options.before);
  }

  const query = params.toString();
  return apiFetch<ChatMessagesPage>(
    `/data/chats/${chatId}/messages${query ? `?${query}` : ''}`,
  );
}

export function addMessageToChat(
  chatId: string,
  text: string,
  options: { replyToMessageId?: string } = {},
) {
  return apiFetch<DetailedChat['messages'][number]>(
    `/data/chats/${chatId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({
        text,
        ...(options.replyToMessageId
          ? { replyToMessageId: options.replyToMessageId }
          : {}),
      }),
    },
  );
}

export function deleteMessageFromChat(chatId: string, messageId: string) {
  return apiFetch<{ deleted: boolean }>(
    `/data/chats/${chatId}/messages/${messageId}`,
    {
      method: 'DELETE',
    },
  );
}

export function markChatRead(chatId: string) {
  return apiFetch<{ readAt: string }>(`/data/chats/${chatId}/read`, {
    method: 'POST',
  });
}
