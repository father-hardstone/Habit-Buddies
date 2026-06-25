import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { User } from '../users/user.entity';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { DailyService } from './daily.service';
import { CallSession } from './entities/call-session.entity';
import { Message } from '../chats/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CallSession,
      Message,
      ConversationParticipant,
      User,
    ]),
  ],
  controllers: [CallsController],
  providers: [CallsService, DailyService],
  exports: [CallsService],
})
export class CallsModule {}
