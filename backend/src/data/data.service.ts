import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { formatDistanceToNow, format, parseISO, subDays } from 'date-fns';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { RankChange } from '../common/enums/rank-change.enum';
import { Conversation } from '../chats/entities/conversation.entity';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { Message } from '../chats/entities/message.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GroupTag } from '../groups/entities/group-tag.entity';
import { Group } from '../groups/entities/group.entity';
import { HabitCompletion } from '../habits/entities/habit-completion.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { Habit } from '../habits/entities/habit.entity';
import {
  aggregateDailyCounts,
  canLogHabit,
  clampDailyLogLimit,
  computeStreak,
  computeWeeklyLogCount,
  computeWeeklyPoints,
  datesWithActivity,
  isInCurrentWeek,
  pointsPerLog,
  toDateString,
} from '../habits/habit-stats';
import { User } from '../users/user.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/data.dto';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
    @InjectRepository(GroupTag)
    private readonly groupTagsRepository: Repository<GroupTag>,
    @InjectRepository(Habit)
    private readonly habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private readonly habitLogsRepository: Repository<HabitLog>,
    @InjectRepository(HabitCompletion)
    private readonly habitCompletionsRepository: Repository<HabitCompletion>,
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantsRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private mapGroupSummary(
    group: Group,
    memberCount: number,
    options?: { creatorName?: string; isJoined?: boolean },
  ) {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.imageUrl ?? '',
      aiHint: group.aiHint ?? '',
      tags: group.tags?.map((tag) => tag.tag) ?? [],
      adminId: group.adminId,
      creatorName: options?.creatorName ?? group.admin?.name ?? 'Unknown',
      members: memberCount,
      isJoined: options?.isJoined ?? false,
      isPublic: group.isPublic ?? true,
    };
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private mapHabitForUser(habit: Habit, completions: HabitCompletion[]) {
    const weeklyCompleted = computeWeeklyLogCount(completions);
    const streak = computeStreak(datesWithActivity(completions));
    const weeklyPoints = computeWeeklyPoints(completions);
    const logStatus = canLogHabit(habit, completions);

    return {
      id: habit.id,
      name: habit.name,
      goal: habit.goal,
      completed: weeklyCompleted,
      streak,
      weeklyPoints: Math.round(weeklyPoints * 1000) / 1000,
      color: habit.color,
      icon: habit.icon ?? undefined,
      allowMultipleLogsPerDay: habit.allowMultipleLogsPerDay,
      dailyLogLimit: clampDailyLogLimit(habit.dailyLogLimit),
      pointsPerLog: pointsPerLog(habit),
      canLog: logStatus.allowed,
      history: aggregateDailyCounts(completions),
    };
  }

  private mapHabit(habit: Habit) {
    return {
      id: habit.id,
      name: habit.name,
      goal: habit.goal,
      completed: habit.completed,
      streak: habit.streak,
      color: habit.color,
      icon: habit.icon ?? undefined,
      history:
        habit.logs?.map((log) => ({
          date: log.completedDate,
          completed: log.completed,
        })) ?? [],
    };
  }

  private async ensureGroupMember(groupId: string, userId: string) {
    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }
  }

  async getAllGroups(userId: string) {
    const groups = await this.groupsRepository.find({
      relations: { tags: true, admin: true },
      order: { name: 'ASC' },
    });

    const memberships = await this.groupMembersRepository.find({
      where: { userId },
    });
    const joinedSet = new Set(memberships.map((entry) => entry.groupId));

    const counts = await this.groupMembersRepository
      .createQueryBuilder('member')
      .select('member.groupId', 'groupId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('member.groupId')
      .getRawMany<{ groupId: string; count: string }>();

    const countMap = new Map(
      counts.map((row) => [row.groupId, Number(row.count)]),
    );

    return groups
      .filter((group) => group.isPublic || joinedSet.has(group.id))
      .map((group) =>
      this.mapGroupSummary(group, countMap.get(group.id) ?? 0, {
        creatorName: group.admin.name,
        isJoined: joinedSet.has(group.id),
      }),
    );
  }

  async createGroup(userId: string, dto: CreateGroupDto) {
    const imageUrl =
      dto.imageUrl ??
      `https://placehold.co/600x400/9333ea/ffffff?text=${encodeURIComponent(dto.name.slice(0, 20))}`;

    const group = await this.groupsRepository.save(
      this.groupsRepository.create({
        name: dto.name.trim(),
        description: dto.description.trim(),
        imageUrl,
        aiHint: dto.aiHint?.trim() ?? 'community group',
        adminId: userId,
        isPublic: dto.isPublic ?? true,
        inviteToken: randomUUID(),
      }),
    );

    const tags = (dto.tags ?? [])
      .map((tag) => tag.trim())
      .filter(Boolean);

    for (const tag of tags) {
      await this.groupTagsRepository.save(
        this.groupTagsRepository.create({ groupId: group.id, tag }),
      );
    }

    await this.groupMembersRepository.save(
      this.groupMembersRepository.create({
        groupId: group.id,
        userId,
        rank: 1,
        score: 0,
        rankChange: RankChange.UP,
      }),
    );

    const saved = await this.groupsRepository.findOne({
      where: { id: group.id },
      relations: { tags: true, admin: true, members: true },
    });

    if (!saved) {
      throw new NotFoundException('Group not found after creation');
    }

    return this.mapGroupSummary(saved, saved.members.length, {
      creatorName: saved.admin.name,
      isJoined: true,
    });
  }

  async joinGroup(groupId: string, userId: string) {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: { tags: true, admin: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!group.isPublic) {
      throw new ForbiddenException(
        'This group is private. Ask the owner for an invite link.',
      );
    }

    return this.addUserToGroup(group, userId);
  }

  private async ensureInviteToken(group: Group): Promise<string> {
    if (group.inviteToken) {
      return group.inviteToken;
    }

    group.inviteToken = randomUUID();
    await this.groupsRepository.save(group);
    return group.inviteToken;
  }

  private buildInviteUrl(token: string) {
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    return `${frontendUrl.replace(/\/$/, '')}/groups/invite/${token}`;
  }

  async getGroupInviteLink(groupId: string, userId: string) {
    const group = await this.ensureGroupAdmin(groupId, userId);
    const inviteToken = await this.ensureInviteToken(group);

    return {
      inviteToken,
      inviteUrl: this.buildInviteUrl(inviteToken),
      isPublic: group.isPublic,
      groupName: group.name,
    };
  }

  async getInvitePreview(token: string, userId: string) {
    const preview = await this.getPublicInvitePreview(token);

    const membership = await this.groupMembersRepository.findOne({
      where: { groupId: preview.group.id, userId },
    });

    return {
      ...preview,
      group: {
        ...preview.group,
        isJoined: Boolean(membership),
      },
    };
  }

  async getPublicInvitePreview(token: string) {
    const group = await this.groupsRepository.findOne({
      where: { inviteToken: token },
      relations: { tags: true, admin: true },
    });

    if (!group) {
      throw new NotFoundException('Invite link is invalid or expired');
    }

    const memberCount = await this.groupMembersRepository.count({
      where: { groupId: group.id },
    });

    return {
      group: this.mapGroupSummary(group, memberCount, {
        creatorName: group.admin?.name ?? 'Unknown',
        isJoined: false,
      }),
      inviteUrl: this.buildInviteUrl(token),
    };
  }

  async joinGroupByInvite(token: string, userId: string) {
    const group = await this.groupsRepository.findOne({
      where: { inviteToken: token },
      relations: { tags: true, admin: true },
    });

    if (!group) {
      throw new NotFoundException('Invite link is invalid or expired');
    }

    return this.addUserToGroup(group, userId);
  }

  private async addUserToGroup(group: Group, userId: string) {
    const existing = await this.groupMembersRepository.findOne({
      where: { groupId: group.id, userId },
    });

    if (existing) {
      throw new ConflictException('You are already a member of this group');
    }

    const memberCount = await this.groupMembersRepository.count({
      where: { groupId: group.id },
    });

    await this.groupMembersRepository.save(
      this.groupMembersRepository.create({
        groupId: group.id,
        userId,
        rank: memberCount + 1,
        score: 0,
        rankChange: RankChange.UP,
      }),
    );

    return this.mapGroupSummary(group, memberCount + 1, {
      creatorName: group.admin.name,
      isJoined: true,
    });
  }

  private async ensureGroupAdmin(groupId: string, userId: string) {
    const group = await this.groupsRepository.findOne({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.adminId !== userId) {
      throw new ForbiddenException('Only the group creator can change settings');
    }

    return group;
  }

  async updateGroup(groupId: string, userId: string, dto: UpdateGroupDto) {
    const group = await this.ensureGroupAdmin(groupId, userId);

    if (dto.name !== undefined) {
      group.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      group.description = dto.description.trim();
    }
    if (dto.isPublic !== undefined) {
      group.isPublic = dto.isPublic;
    }

    await this.groupsRepository.save(group);

    if (dto.tags !== undefined) {
      await this.groupTagsRepository.delete({ groupId });
      const tags = dto.tags.map((tag) => tag.trim()).filter(Boolean);
      for (const tag of tags) {
        await this.groupTagsRepository.save(
          this.groupTagsRepository.create({ groupId, tag }),
        );
      }
    }

    const saved = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: { tags: true, admin: true, members: true },
    });

    if (!saved) {
      throw new NotFoundException('Group not found after update');
    }

    return this.mapGroupSummary(saved, saved.members.length, {
      creatorName: saved.admin.name,
      isJoined: true,
    });
  }

  async updateGroupImage(
    groupId: string,
    userId: string,
    imageUrl: string,
  ) {
    const group = await this.ensureGroupAdmin(groupId, userId);
    group.imageUrl = imageUrl;
    await this.groupsRepository.save(group);

    const saved = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: { tags: true, admin: true, members: true },
    });

    if (!saved) {
      throw new NotFoundException('Group not found after update');
    }

    return this.mapGroupSummary(saved, saved.members.length, {
      creatorName: saved.admin.name,
      isJoined: true,
    });
  }

  private async getWeeklyScoresForGroup(groupId: string) {
    const habits = await this.habitsRepository.find({ where: { groupId } });
    const habitIds = habits.map((habit) => habit.id);
    if (habitIds.length === 0) {
      return new Map<string, number>();
    }

    const weekStart = subDays(new Date(), 7);
    const completions = await this.habitCompletionsRepository.find({
      where: {
        habitId: In(habitIds),
        loggedAt: MoreThanOrEqual(weekStart),
      },
    });

    const scores = new Map<string, number>();
    for (const completion of completions) {
      if (!isInCurrentWeek(completion.loggedAt)) {
        continue;
      }
      scores.set(
        completion.userId,
        (scores.get(completion.userId) ?? 0) + Number(completion.points),
      );
    }

    return scores;
  }

  async getGroupById(id: string) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: {
        tags: true,
        members: { user: true },
        habits: { logs: true },
      },
    });

    if (!group) return undefined;

    const weeklyScores = await this.getWeeklyScoresForGroup(id);

    const members = group.members
      .map((member) => ({
        userId: member.userId,
        score: Math.round((weeklyScores.get(member.userId) ?? 0) * 100) / 100,
        rank: member.rank,
        change: member.rankChange,
        online: member.online,
        name: member.user.name,
        avatar: member.user.avatarUrl ?? 'https://placehold.co/40x40.png',
        isAdmin: group.adminId === member.userId,
      }))
      .sort((a, b) => b.score - a.score)
      .map((member, index) => ({
        ...member,
        rank: index + 1,
      }));

    return {
      ...this.mapGroupSummary(group, members.length),
      members,
      habits: group.habits.map((habit) => this.mapHabit(habit)),
    };
  }

  async getJoinedGroups(userId: string) {
    const memberships = await this.groupMembersRepository.find({
      where: { userId },
      relations: { group: { tags: true, members: true, admin: true } },
    });

    if (memberships.length === 0) {
      return [];
    }

    return memberships
      .filter((membership) => membership.group != null)
      .map((membership) =>
        this.mapGroupSummary(
          membership.group,
          membership.group.members.length,
          {
            creatorName: membership.group.admin?.name ?? 'Unknown',
            isJoined: true,
          },
        ),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getHabitsForGroup(groupId: string, userId: string) {
    await this.ensureGroupMember(groupId, userId);

    const habits = await this.habitsRepository.find({
      where: { groupId },
      order: { createdAt: 'ASC' },
    });

    if (habits.length === 0) {
      return [];
    }

    const habitIds = habits.map((habit) => habit.id);
    const completions = await this.habitCompletionsRepository.find({
      where: { habitId: In(habitIds), userId },
      order: { loggedAt: 'ASC' },
    });

    const completionsByHabit = new Map<string, HabitCompletion[]>();
    for (const completion of completions) {
      const existing = completionsByHabit.get(completion.habitId) ?? [];
      existing.push(completion);
      completionsByHabit.set(completion.habitId, existing);
    }

    return habits.map((habit) =>
      this.mapHabitForUser(habit, completionsByHabit.get(habit.id) ?? []),
    );
  }

  async completeHabit(groupId: string, habitId: string, userId: string) {
    await this.ensureGroupMember(groupId, userId);

    const habit = await this.habitsRepository.findOne({
      where: { id: habitId, groupId },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    const completions = await this.habitCompletionsRepository.find({
      where: { habitId, userId },
      order: { loggedAt: 'DESC' },
    });

    const logStatus = canLogHabit(habit, completions);
    if (!logStatus.allowed) {
      throw new BadRequestException(logStatus.reason ?? 'Cannot log this habit');
    }

    const earnedPoints = pointsPerLog(habit);
    const saved = await this.habitCompletionsRepository.save(
      this.habitCompletionsRepository.create({
        habitId,
        userId,
        loggedAt: new Date(),
        points: earnedPoints.toFixed(4),
      }),
    );

    const updatedCompletions = [saved, ...completions];
    return this.mapHabitForUser(habit, updatedCompletions);
  }

  async getGroupAnalytics(groupId: string, userId: string) {
    await this.ensureGroupMember(groupId, userId);

    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: { members: { user: true } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const habits = await this.habitsRepository.find({
      where: { groupId },
      order: { createdAt: 'ASC' },
    });
    const habitIds = habits.map((habit) => habit.id);

    const weekStart = subDays(new Date(), 6);
    weekStart.setHours(0, 0, 0, 0);

    const completions =
      habitIds.length > 0
        ? await this.habitCompletionsRepository.find({
            where: {
              habitId: In(habitIds),
              loggedAt: MoreThanOrEqual(weekStart),
            },
            order: { loggedAt: 'ASC' },
          })
        : [];

    const dayKeys = Array.from({ length: 7 }).map((_, index) =>
      toDateString(subDays(new Date(), 6 - index)),
    );

    const dayLabel = (date: string) => format(parseISO(date), 'EEE');

    const personalHabits = habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      color: habit.color,
      icon: habit.icon ?? undefined,
    }));

    const personalDaily = dayKeys.map((date) => {
      const row: Record<string, string | number> = {
        date,
        label: dayLabel(date),
        points: 0,
      };

      for (const habit of habits) {
        const habitPoints = completions
          .filter(
            (entry) =>
              entry.userId === userId &&
              entry.habitId === habit.id &&
              toDateString(entry.loggedAt) === date,
          )
          .reduce((sum, entry) => sum + Number(entry.points), 0);

        row[habit.id] = Math.round(habitPoints * 1000) / 1000;
        row.points = Math.round((Number(row.points) + habitPoints) * 1000) / 1000;
      }

      return row;
    });

    const memberColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];

    const users = group.members.map((member, index) => ({
      userId: member.userId,
      name: member.user.name,
      color: memberColors[index % memberColors.length],
    }));

    const groupDaily = dayKeys.map((date) => {
      const row: Record<string, string | number> = {
        date,
        label: dayLabel(date),
      };
      for (const user of users) {
        row[user.userId] = completions
          .filter(
            (entry) =>
              entry.userId === user.userId &&
              toDateString(entry.loggedAt) === date,
          )
          .reduce((sum, entry) => sum + Number(entry.points), 0);
      }
      return row;
    });

    const userCompletions = completions.filter(
      (entry) => entry.userId === userId,
    );

    const streakProgress = habits.map((habit) => {
      const habitCompletions = userCompletions.filter(
        (entry) => entry.habitId === habit.id,
      );
      const weeklyCount = computeWeeklyLogCount(habitCompletions);
      const progress = Math.min(
        100,
        Math.round((weeklyCount / Math.max(habit.goal, 1)) * 100),
      );
      const streak = computeStreak(datesWithActivity(habitCompletions));
      return {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        goal: habit.goal,
        completed: weeklyCount,
        streak,
        progress,
        targetReached: weeklyCount >= habit.goal,
      };
    });

    const scoreComposition = habits
      .map((habit) => {
        const points = userCompletions
          .filter((entry) => entry.habitId === habit.id)
          .reduce((sum, entry) => sum + Number(entry.points), 0);
        return {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          points: Math.round(points * 1000) / 1000,
        };
      })
      .filter((entry) => entry.points > 0);

    return {
      personalHabits,
      personalDaily,
      groupDaily,
      users,
      streakProgress,
      scoreComposition,
    };
  }

  async updateGroupHabits(
    groupId: string,
    userId: string,
    habits: {
      id?: string;
      name: string;
      goal: number;
      completed?: number;
      streak?: number;
      color: string;
      icon?: string;
      allowMultipleLogsPerDay?: boolean;
      dailyLogLimit?: number;
      history?: { date: string; completed: number }[];
    }[],
  ) {
    const group = await this.groupsRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const existing = await this.habitsRepository.find({
      where: { groupId },
      relations: { logs: true },
    });

    const incomingIds = new Set(
      habits
        .map((habit) => habit.id)
        .filter((id): id is string => id != null && this.isUuid(id)),
    );

    for (const habit of existing) {
      if (!incomingIds.has(habit.id)) {
        await this.habitsRepository.remove(habit);
      }
    }

    const savedHabits: Habit[] = [];

    for (const habit of habits) {
      const existingId =
        habit.id != null && this.isUuid(habit.id) ? habit.id : null;

      let entity = existingId
        ? await this.habitsRepository.findOne({
            where: { id: existingId, groupId },
            relations: { logs: true },
          })
        : null;

      if (!entity) {
        entity = this.habitsRepository.create({ groupId });
      }

      entity.name = habit.name;
      entity.goal = habit.goal;
      entity.color = habit.color;
      entity.icon = habit.icon ?? null;
      entity.allowMultipleLogsPerDay = habit.allowMultipleLogsPerDay ?? false;
      entity.dailyLogLimit = clampDailyLogLimit(
        habit.dailyLogLimit ?? 1,
      );

      if (!existingId) {
        entity.completed = 0;
        entity.streak = 0;
      }

      const saved = await this.habitsRepository.save(entity);
      savedHabits.push(saved);
    }

    const withLogs = await this.habitsRepository.find({
      where: { id: In(savedHabits.map((habit) => habit.id)) },
    });

    const habitIds = withLogs.map((habit) => habit.id);
    const userCompletions =
      habitIds.length > 0
        ? await this.habitCompletionsRepository.find({
            where: { habitId: In(habitIds), userId },
          })
        : [];

    const completionsByHabit = new Map<string, HabitCompletion[]>();
    for (const completion of userCompletions) {
      const existing = completionsByHabit.get(completion.habitId) ?? [];
      existing.push(completion);
      completionsByHabit.set(completion.habitId, existing);
    }

    return withLogs.map((habit) =>
      this.mapHabitForUser(habit, completionsByHabit.get(habit.id) ?? []),
    );
  }

  private async findSharedGroupName(
    currentUserId: string,
    otherUserId: string,
  ) {
    const currentMemberships = await this.groupMembersRepository.find({
      where: { userId: currentUserId },
    });
    const otherMemberships = await this.groupMembersRepository.find({
      where: { userId: otherUserId },
    });

    const sharedGroupId = currentMemberships.find((entry) =>
      otherMemberships.some((other) => other.groupId === entry.groupId),
    )?.groupId;

    if (!sharedGroupId) {
      return { groupName: 'Unknown Group', online: false };
    }

    const group = await this.groupsRepository.findOne({
      where: { id: sharedGroupId },
      relations: { members: true },
    });

    const otherMember = group?.members.find(
      (member) => member.userId === otherUserId,
    );

    return {
      groupName: group?.name ?? 'Unknown Group',
      online: otherMember?.online ?? false,
    };
  }

  async findOrCreateDirectChat(
    userId: string,
    otherUserId: string,
    groupId?: string,
  ) {
    if (userId === otherUserId) {
      throw new BadRequestException('You cannot start a chat with yourself');
    }

    const otherUser = await this.usersRepository.findOne({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    if (groupId) {
      await this.ensureGroupMember(groupId, userId);
      await this.ensureGroupMember(groupId, otherUserId);
    } else {
      const { groupName } = await this.findSharedGroupName(userId, otherUserId);
      if (groupName === 'Unknown Group') {
        throw new ForbiddenException(
          'You can only chat with members of your groups',
        );
      }
    }

    const participations = await this.participantsRepository.find({
      where: { userId },
      relations: { conversation: { participants: true } },
    });

    for (const participation of participations) {
      const participantIds = participation.conversation.participants.map(
        (entry) => entry.userId,
      );

      if (
        participantIds.length === 2 &&
        participantIds.includes(otherUserId)
      ) {
        return {
          chatId: participation.conversationId,
          created: false,
        };
      }
    }

    const conversation = await this.conversationsRepository.save(
      this.conversationsRepository.create({}),
    );

    await this.participantsRepository.save([
      this.participantsRepository.create({
        conversationId: conversation.id,
        userId,
      }),
      this.participantsRepository.create({
        conversationId: conversation.id,
        userId: otherUserId,
      }),
    ]);

    return {
      chatId: conversation.id,
      created: true,
    };
  }

  async getChatsForUser(userId: string) {
    const participations = await this.participantsRepository.find({
      where: { userId },
      relations: {
        conversation: {
          participants: { user: true },
          messages: true,
        },
      },
    });

    const chats = await Promise.all(
      participations.map(async (participation) => {
        const conversation = participation.conversation;
        const otherParticipant = conversation.participants.find(
          (entry) => entry.userId !== userId,
        )?.user;

        if (!otherParticipant) {
          return null;
        }

        const sortedMessages = [...conversation.messages].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        const lastMessage = sortedMessages[sortedMessages.length - 1];

        const unreadCount = sortedMessages.filter(
          (message) =>
            message.senderId !== userId &&
            (participation.lastReadAt == null ||
              message.createdAt > participation.lastReadAt),
        ).length;

        const { groupName, online } = await this.findSharedGroupName(
          userId,
          otherParticipant.id,
        );

        const activityAt = lastMessage?.createdAt ?? conversation.createdAt;

        const otherParticipation = conversation.participants.find(
          (entry) => entry.userId === otherParticipant.id,
        );
        const peerLastReadAt = otherParticipation?.lastReadAt ?? null;

        const lastMessageIsMine = lastMessage?.senderId === userId;

        return {
          id: conversation.id,
          name: otherParticipant.name,
          avatar:
            otherParticipant.avatarUrl ?? 'https://placehold.co/40x40.png',
          aiHint: 'user avatar',
          latestMessage: lastMessage?.text ?? 'No messages yet',
          lastMessageSenderId: lastMessage?.senderId ?? null,
          lastMessageStatus:
            lastMessageIsMine && lastMessage
              ? this.senderMessageStatus(lastMessage.createdAt, peerLastReadAt)
              : null,
          timestamp: activityAt.toISOString(),
          formattedTimestamp: formatDistanceToNow(activityAt, {
            addSuffix: true,
          }),
          unreadCount,
          online,
          groupName,
        };
      }),
    );

    return chats
      .filter((chat): chat is NonNullable<typeof chat> => chat != null)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  private senderMessageStatus(
    createdAt: Date,
    peerLastReadAt: Date | null,
  ): 'read' | 'delivered' {
    if (
      peerLastReadAt &&
      createdAt.getTime() <= peerLastReadAt.getTime()
    ) {
      return 'read';
    }

    return 'delivered';
  }

  private mapChatMessage(
    message: {
      id: string;
      text: string;
      senderId: string;
      createdAt: Date;
      messageType?: 'text' | 'call';
      callSessionId?: string | null;
      callMode?: 'audio' | 'video' | null;
      callStatus?: string | null;
      callDurationSeconds?: number | null;
      callEndedAt?: Date | null;
      conversationId?: string;
      replyToMessageId?: string | null;
      replyToText?: string | null;
      replyToSenderId?: string | null;
    },
    userId: string,
    peerLastReadAt: Date | null = null,
  ) {
    const isMe = message.senderId === userId;
    const replyTo =
      message.replyToMessageId && message.replyToText && message.replyToSenderId
        ? {
            id: message.replyToMessageId,
            text: message.replyToText,
            senderId: message.replyToSenderId,
            sender:
              message.replyToSenderId === userId
                ? ('me' as const)
                : ('other' as const),
          }
        : undefined;

    const base = {
      id: message.id,
      sender: isMe ? ('me' as const) : ('other' as const),
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      ...(replyTo ? { replyTo } : {}),
      ...(isMe
        ? { status: this.senderMessageStatus(message.createdAt, peerLastReadAt) }
        : {}),
    };

    if (message.messageType === 'call' && message.callSessionId) {
      return {
        ...base,
        messageType: 'call' as const,
        call: {
          id: message.callSessionId,
          chatId: message.conversationId ?? '',
          mode: message.callMode ?? 'audio',
          status: message.callStatus ?? 'ended',
          initiatorId: message.senderId,
          isOutgoing: isMe,
          createdAt: message.createdAt.toISOString(),
          endedAt: message.callEndedAt?.toISOString() ?? null,
          durationSeconds: message.callDurationSeconds ?? null,
        },
      };
    }

    return base;
  }

  private async getChatContext(chatId: string, userId: string) {
    const participation = await this.participantsRepository.findOne({
      where: { conversationId: chatId, userId },
      relations: {
        conversation: {
          participants: { user: true },
        },
      },
    });

    if (!participation) {
      return undefined;
    }

    const conversation = participation.conversation;
    const otherParticipant = conversation.participants.find(
      (entry) => entry.userId !== userId,
    )?.user;

    if (!otherParticipant) {
      return undefined;
    }

    const otherParticipation = conversation.participants.find(
      (entry) => entry.userId === otherParticipant.id,
    );

    const { groupName, online } = await this.findSharedGroupName(
      userId,
      otherParticipant.id,
    );

    return {
      participation,
      conversation,
      otherParticipant,
      peerLastReadAt: otherParticipation?.lastReadAt ?? null,
      groupName,
      online,
    };
  }

  async getChatById(chatId: string, userId: string) {
    const context = await this.getChatContext(chatId, userId);

    if (!context) {
      return undefined;
    }

    const { participation, conversation, otherParticipant, peerLastReadAt, groupName, online } =
      context;

    const readAt = new Date();
    participation.lastReadAt = readAt;
    await this.participantsRepository.save(participation);

    this.realtimeService.broadcastChatRead(chatId, {
      userId,
      readAt: readAt.toISOString(),
    });

    this.realtimeService.broadcastInboxRead(userId, chatId);

    void this.notifyPeersInboxRead(chatId, userId, readAt);

    return {
      id: conversation.id,
      name: otherParticipant.name,
      avatar: otherParticipant.avatarUrl ?? 'https://placehold.co/40x40.png',
      online,
      groupName,
      peerLastReadAt: peerLastReadAt?.toISOString() ?? null,
      messages: [],
    };
  }

  async getChatMessages(
    chatId: string,
    userId: string,
    options: { limit?: number; before?: string; after?: string } = {},
  ) {
    const context = await this.getChatContext(chatId, userId);

    if (!context) {
      throw new NotFoundException('Chat not found');
    }

    const limit = Math.min(Math.max(options.limit ?? 30, 1), 50);
    const { peerLastReadAt } = context;

    if (options.after) {
      const afterDate = new Date(options.after);
      if (Number.isNaN(afterDate.getTime())) {
        throw new BadRequestException('Invalid after cursor');
      }

      const rows = await this.messagesRepository
        .createQueryBuilder('message')
        .where('message.conversationId = :chatId', { chatId })
        .andWhere('message.createdAt > :after', { after: afterDate })
        .orderBy('message.createdAt', 'ASC')
        .take(limit)
        .getMany();

      return {
        messages: rows.map((message) =>
          this.mapChatMessage(message, userId, peerLastReadAt),
        ),
        hasMore: false,
      };
    }

    const query = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit + 1);

    if (options.before) {
      const beforeDate = new Date(options.before);
      if (Number.isNaN(beforeDate.getTime())) {
        throw new BadRequestException('Invalid before cursor');
      }

      query.andWhere('message.createdAt < :before', { before: beforeDate });
    }

    const rows = await query.getMany();
    const hasMore = rows.length > limit;
    const page = (hasMore ? rows.slice(0, limit) : rows).reverse();

    return {
      messages: page.map((message) =>
        this.mapChatMessage(message, userId, peerLastReadAt),
      ),
      hasMore,
    };
  }

  private async notifyPeersInboxRead(
    chatId: string,
    readerUserId: string,
    readAt: Date,
  ): Promise<void> {
    const participants = await this.participantsRepository.find({
      where: { conversationId: chatId },
      select: { userId: true },
    });

    for (const participant of participants) {
      if (participant.userId === readerUserId) {
        continue;
      }

      this.realtimeService.broadcastInboxPeerRead(participant.userId, {
        chatId,
        readAt: readAt.toISOString(),
      });
    }
  }

  async markChatRead(chatId: string, userId: string) {
    const participation = await this.participantsRepository.findOne({
      where: { conversationId: chatId, userId },
      select: { id: true },
    });

    if (!participation) {
      throw new NotFoundException('Chat not found');
    }

    const readAt = new Date();
    await this.participantsRepository.update(
      { conversationId: chatId, userId },
      { lastReadAt: readAt },
    );

    this.realtimeService.broadcastChatRead(chatId, {
      userId,
      readAt: readAt.toISOString(),
    });

    this.realtimeService.broadcastInboxRead(userId, chatId);

    void this.notifyPeersInboxRead(chatId, userId, readAt);

    return { readAt: readAt.toISOString() };
  }

  async addMessageToChat(
    chatId: string,
    userId: string,
    text: string,
    replyToMessageId?: string,
  ) {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new BadRequestException('Message cannot be empty');
    }

    const participation = await this.participantsRepository.findOne({
      where: { conversationId: chatId, userId },
      select: { id: true },
    });

    if (!participation) {
      throw new NotFoundException('Chat not found');
    }

    let replyToText: string | null = null;
    let replyToSenderId: string | null = null;

    if (replyToMessageId) {
      const replyTarget = await this.messagesRepository.findOne({
        where: { id: replyToMessageId, conversationId: chatId },
        select: { id: true, text: true, senderId: true },
      });

      if (!replyTarget) {
        throw new BadRequestException('Reply message not found');
      }

      replyToText = replyTarget.text;
      replyToSenderId = replyTarget.senderId;
    }

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        conversationId: chatId,
        senderId: userId,
        text: trimmed,
        replyToMessageId: replyToMessageId ?? null,
        replyToText,
        replyToSenderId,
      }),
    );

    const mapped = this.mapChatMessage(message, userId);
    const payload = {
      ...mapped,
      status: 'sent' as const,
    };

    void this.participantsRepository.update(
      { conversationId: chatId, userId },
      { lastReadAt: new Date() },
    );

    this.realtimeService.broadcastNewMessage(chatId, {
      id: message.id,
      conversationId: chatId,
      senderId: userId,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      ...(mapped.replyTo
        ? {
            replyTo: {
              id: mapped.replyTo.id,
              text: mapped.replyTo.text,
              senderId: mapped.replyTo.senderId,
            },
          }
        : {}),
    });

    const participants = await this.participantsRepository.find({
      where: { conversationId: chatId },
      select: { userId: true },
    });

    for (const participant of participants) {
      this.realtimeService.broadcastInboxUpdate(participant.userId, {
        chatId,
        latestMessage: trimmed,
        timestamp: message.createdAt.toISOString(),
        senderId: userId,
      });
    }

    return payload;
  }

  async deleteMessageFromChat(
    chatId: string,
    messageId: string,
    userId: string,
  ) {
    const participation = await this.participantsRepository.findOne({
      where: { conversationId: chatId, userId },
      select: { id: true },
    });

    if (!participation) {
      throw new NotFoundException('Chat not found');
    }

    const message = await this.messagesRepository.findOne({
      where: { id: messageId, conversationId: chatId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    const latestMessage = await this.messagesRepository.findOne({
      where: { conversationId: chatId },
      order: { createdAt: 'DESC' },
      select: { id: true },
    });

    const wasLatest = latestMessage?.id === message.id;

    await this.messagesRepository.delete(message.id);

    this.realtimeService.broadcastMessageDeleted(chatId, { messageId });

    if (wasLatest) {
      const previous = await this.messagesRepository.findOne({
        where: { conversationId: chatId },
        order: { createdAt: 'DESC' },
      });

      const participants = await this.participantsRepository.find({
        where: { conversationId: chatId },
        select: { userId: true },
      });

      for (const participant of participants) {
        this.realtimeService.broadcastInboxUpdate(participant.userId, {
          chatId,
          latestMessage: previous?.text ?? 'No messages yet',
          timestamp: (previous?.createdAt ?? new Date()).toISOString(),
          senderId: previous?.senderId ?? userId,
        });
      }
    }

    return { deleted: true };
  }
}
