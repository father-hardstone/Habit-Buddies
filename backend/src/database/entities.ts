import { User } from '../users/user.entity';
import { PasswordReset } from '../auth/entities/password-reset.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GroupTag } from '../groups/entities/group-tag.entity';
import { Habit } from '../habits/entities/habit.entity';
import { HabitCompletion } from '../habits/entities/habit-completion.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { Conversation } from '../chats/entities/conversation.entity';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { Message } from '../chats/entities/message.entity';
import { CallSession } from '../calls/entities/call-session.entity';

export const entities = [
  User,
  PasswordReset,
  Group,
  GroupMember,
  GroupTag,
  Habit,
  HabitLog,
  HabitCompletion,
  Conversation,
  ConversationParticipant,
  Message,
  CallSession,
];
