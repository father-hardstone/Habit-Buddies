import 'reflect-metadata';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserRole } from '../common/enums/user-role.enum';
import { RankChange } from '../common/enums/rank-change.enum';
import { User } from '../users/user.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GroupTag } from '../groups/entities/group-tag.entity';
import { Habit } from '../habits/entities/habit.entity';
import { HabitCompletion } from '../habits/entities/habit-completion.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { Conversation } from '../chats/entities/conversation.entity';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { Message } from '../chats/entities/message.entity';
import { entities } from './entities';

config({ path: join(__dirname, '../../.env') });

type DemoUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  groups: { groupId: string; rank: number }[];
};

type DemoGroup = {
  id: string;
  name: string;
  description: string;
  image: string;
  aiHint: string;
  tags: string[];
  adminId: number;
  members: {
    userId: number;
    score: number;
    rank: number;
    change: 'up' | 'down';
    online: boolean;
  }[];
  habits: {
    id: string;
    name: string;
    icon?: string;
    goal: number;
    completed: number;
    streak: number;
    color: string;
    history?: { date: string; completed: number }[];
  }[];
};

type DemoChat = {
  id: string;
  participantIds: number[];
  unreadCount: number;
  messages: {
    id: number;
    senderId: number;
    text: string;
    timestamp: string;
  }[];
};

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
    entities,
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const existingUsers = await userRepo.count();

  if (existingUsers > 0) {
    console.log('Database already has users — skipping seed.');
    await dataSource.destroy();
    return;
  }

  const databasesPath = join(process.cwd(), 'databases');
  const demoUsers = JSON.parse(
    readFileSync(join(databasesPath, 'users.json'), 'utf-8'),
  ) as DemoUser[];
  const demoGroups = JSON.parse(
    readFileSync(join(databasesPath, 'groups.json'), 'utf-8'),
  ) as DemoGroup[];
  const demoChats = JSON.parse(
    readFileSync(join(databasesPath, 'chats.json'), 'utf-8'),
  ) as DemoChat[];

  const demoPasswordHash = await bcrypt.hash('Demo123456', 10);
  const userIdMap = new Map<number, string>();

  for (const demoUser of demoUsers) {
    const saved = await userRepo.save(
      userRepo.create({
        email: demoUser.email.toLowerCase(),
        passwordHash: demoPasswordHash,
        name: demoUser.name,
        avatarUrl: demoUser.avatar,
        role: UserRole.USER,
      }),
    );
    userIdMap.set(demoUser.id, saved.id);
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@habitbuddies.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'adminpassword123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await userRepo.save(
    userRepo.create({
      email: adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      name: 'Admin',
      avatarUrl: null,
      role: UserRole.ADMIN,
    }),
  );

  const groupRepo = dataSource.getRepository(Group);
  const groupMemberRepo = dataSource.getRepository(GroupMember);
  const groupTagRepo = dataSource.getRepository(GroupTag);
  const habitRepo = dataSource.getRepository(Habit);
  const habitLogRepo = dataSource.getRepository(HabitLog);
  const habitCompletionRepo = dataSource.getRepository(HabitCompletion);
  const conversationRepo = dataSource.getRepository(Conversation);
  const participantRepo = dataSource.getRepository(ConversationParticipant);
  const messageRepo = dataSource.getRepository(Message);

  const groupIdMap = new Map<string, string>();

  for (const demoGroup of demoGroups) {
    const adminId = userIdMap.get(demoGroup.adminId);
    if (!adminId) continue;

    const savedGroup = await groupRepo.save(
      groupRepo.create({
        name: demoGroup.name,
        description: demoGroup.description,
        imageUrl: demoGroup.image,
        aiHint: demoGroup.aiHint,
        adminId,
      }),
    );
    groupIdMap.set(demoGroup.id, savedGroup.id);

    for (const tag of demoGroup.tags) {
      await groupTagRepo.save(
        groupTagRepo.create({ groupId: savedGroup.id, tag }),
      );
    }

    for (const member of demoGroup.members) {
      const userId = userIdMap.get(member.userId);
      if (!userId) continue;

      await groupMemberRepo.save(
        groupMemberRepo.create({
          groupId: savedGroup.id,
          userId,
          score: member.score,
          rank: member.rank,
          rankChange: member.change as RankChange,
          online: member.online,
        }),
      );
    }

    for (const demoHabit of demoGroup.habits) {
      const savedHabit = await habitRepo.save(
        habitRepo.create({
          groupId: savedGroup.id,
          name: demoHabit.name,
          icon: demoHabit.icon ?? null,
          goal: demoHabit.goal,
          completed: demoHabit.completed,
          streak: demoHabit.streak,
          color: demoHabit.color,
        }),
      );

      for (const entry of demoHabit.history ?? []) {
        await habitLogRepo.save(
          habitLogRepo.create({
            habitId: savedHabit.id,
            userId: savedGroup.adminId,
            completedDate: entry.date,
            completed: entry.completed,
          }),
        );

        for (let i = 0; i < entry.completed; i += 1) {
          await habitCompletionRepo.save(
            habitCompletionRepo.create({
              habitId: savedHabit.id,
              userId: savedGroup.adminId,
              loggedAt: new Date(`${entry.date}T12:00:00.000Z`),
              points: '1.0000',
            }),
          );
        }
      }
    }
  }

  for (const demoUser of demoUsers) {
    for (const membership of demoUser.groups) {
      const groupId = groupIdMap.get(membership.groupId);
      const userId = userIdMap.get(demoUser.id);
      if (!groupId || !userId) continue;

      const existing = await groupMemberRepo.findOne({
        where: { groupId, userId },
      });

      if (!existing) {
        await groupMemberRepo.save(
          groupMemberRepo.create({
            groupId,
            userId,
            rank: membership.rank,
            rankChange: RankChange.UP,
          }),
        );
      }
    }
  }

  for (const demoChat of demoChats) {
    const conversation = await conversationRepo.save(conversationRepo.create({}));

    for (const participantId of demoChat.participantIds) {
      const userId = userIdMap.get(participantId);
      if (!userId) continue;

      await participantRepo.save(
        participantRepo.create({
          conversationId: conversation.id,
          userId,
          lastReadAt:
            demoChat.unreadCount === 0 ? new Date() : null,
        }),
      );
    }

    for (const demoMessage of demoChat.messages) {
      const senderId = userIdMap.get(demoMessage.senderId);
      if (!senderId) continue;

      await messageRepo.save(
        messageRepo.create({
          conversationId: conversation.id,
          senderId,
          text: demoMessage.text,
          createdAt: new Date(demoMessage.timestamp),
        }),
      );
    }
  }

  console.log(
    `Seeded ${demoUsers.length} users, ${demoGroups.length} groups, ${demoChats.length} conversations.`,
  );
  console.log('Demo login password for seeded users: Demo123456');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
