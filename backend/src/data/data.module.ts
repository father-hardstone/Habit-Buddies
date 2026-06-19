import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../chats/entities/conversation.entity';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { Message } from '../chats/entities/message.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GroupTag } from '../groups/entities/group-tag.entity';
import { Group } from '../groups/entities/group.entity';
import { HabitCompletion } from '../habits/entities/habit-completion.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { Habit } from '../habits/entities/habit.entity';
import { User } from '../users/user.entity';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupTag,
      Habit,
      HabitLog,
      HabitCompletion,
      Conversation,
      ConversationParticipant,
      Message,
      User,
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
