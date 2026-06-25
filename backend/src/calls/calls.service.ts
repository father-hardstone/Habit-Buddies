import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../chats/entities/message.entity';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { User } from '../users/user.entity';
import { buildCallMessagePreview } from './call-message.util';
import { DailyService } from './daily.service';
import {
  CallSession,
  type CallMode,
  type CallStatus,
} from './entities/call-session.entity';

const ACTIVE_STATUSES: CallStatus[] = ['ringing', 'ongoing'];

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(CallSession)
    private readonly callSessionsRepository: Repository<CallSession>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantsRepository: Repository<ConversationParticipant>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dailyService: DailyService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private async getParticipants(chatId: string, userId: string) {
    const participants = await this.participantsRepository.find({
      where: { conversationId: chatId },
      relations: { user: true },
    });

    const self = participants.find((entry) => entry.userId === userId);

    if (!self) {
      throw new NotFoundException('Chat not found');
    }

    const peer = participants.find((entry) => entry.userId !== userId);

    if (!peer?.user) {
      throw new NotFoundException('Chat peer not found');
    }

    return { self, peer, participants };
  }

  private mapCallLog(call: CallSession, userId: string) {
    return {
      id: call.id,
      chatId: call.conversationId,
      mode: call.mode,
      status: call.status,
      initiatorId: call.initiatorId,
      isOutgoing: call.initiatorId === userId,
      createdAt: call.createdAt.toISOString(),
      endedAt: call.endedAt?.toISOString() ?? null,
      durationSeconds: call.durationSeconds,
    };
  }

  private mapCallMessage(message: Message, userId: string) {
    return {
      id: message.id,
      sender: message.senderId === userId ? ('me' as const) : ('other' as const),
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      messageType: 'call' as const,
      call: {
        id: message.callSessionId ?? '',
        chatId: message.conversationId,
        mode: message.callMode ?? 'audio',
        status: message.callStatus ?? 'ended',
        initiatorId: message.senderId,
        isOutgoing: message.senderId === userId,
        createdAt: message.createdAt.toISOString(),
        endedAt: message.callEndedAt?.toISOString() ?? null,
        durationSeconds: message.callDurationSeconds,
      },
    };
  }

  private async persistCallMessage(
    call: CallSession,
    status: CallStatus,
    durationSeconds: number | null,
    endedAt: Date,
  ) {
    const existing = await this.messagesRepository.findOne({
      where: { callSessionId: call.id },
    });

    if (existing) {
      return existing;
    }

    const preview = buildCallMessagePreview(call.mode, status, durationSeconds);

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        conversationId: call.conversationId,
        senderId: call.initiatorId,
        text: preview,
        messageType: 'call',
        callSessionId: call.id,
        callMode: call.mode,
        callStatus: status,
        callDurationSeconds: durationSeconds,
        callEndedAt: endedAt,
        createdAt: call.createdAt,
      }),
    );

    const participants = await this.participantsRepository.find({
      where: { conversationId: call.conversationId },
      select: { userId: true },
    });

    for (const participant of participants) {
      const mapped = this.mapCallMessage(message, participant.userId);
      this.realtimeService.broadcastNewMessage(call.conversationId, {
        id: message.id,
        conversationId: call.conversationId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
        messageType: 'call',
        call: mapped.call,
      });

      this.realtimeService.broadcastInboxUpdate(participant.userId, {
        chatId: call.conversationId,
        latestMessage: preview,
        timestamp: message.createdAt.toISOString(),
        senderId: message.senderId,
      });
    }

    return message;
  }

  private async finalizeCall(
    call: CallSession,
    status: CallStatus,
    endedByUserId?: string,
  ) {
    const endedAt = new Date();
    let durationSeconds: number | null = null;

    if (call.answeredAt) {
      durationSeconds = Math.max(
        0,
        Math.floor((endedAt.getTime() - call.answeredAt.getTime()) / 1000),
      );
    }

    call.status = status;
    call.endedAt = endedAt;
    call.durationSeconds = durationSeconds;

    await this.callSessionsRepository.save(call);
    void this.dailyService.deleteRoom(call.dailyRoomName);
    await this.persistCallMessage(call, status, durationSeconds, endedAt);

    return this.mapCallLog(call, endedByUserId ?? call.initiatorId);
  }

  async getCallHistory(chatId: string, userId: string) {
    await this.getParticipants(chatId, userId);

    const calls = await this.callSessionsRepository.find({
      where: { conversationId: chatId },
      order: { createdAt: 'ASC' },
      take: 100,
    });

    return calls.map((call) => this.mapCallLog(call, userId));
  }

  async createCall(chatId: string, userId: string, mode: CallMode) {
    const { peer } = await this.getParticipants(chatId, userId);

    const existingOngoing = await this.callSessionsRepository.findOne({
      where: {
        conversationId: chatId,
        status: 'ongoing',
      },
      order: { createdAt: 'DESC' },
    });

    if (existingOngoing) {
      throw new ConflictException('A call is already active in this chat');
    }

    const staleThreshold = new Date(Date.now() - 2 * 60 * 1000);
    const ringingCalls = await this.callSessionsRepository.find({
      where: {
        conversationId: chatId,
        status: 'ringing',
      },
      order: { createdAt: 'DESC' },
    });

    for (const call of ringingCalls) {
      if (call.createdAt < staleThreshold) {
        await this.finalizeCall(call, 'missed');
      }
    }

    const activeRinging = ringingCalls.find(
      (call) => call.createdAt >= staleThreshold,
    );

    if (activeRinging) {
      if (activeRinging.initiatorId === userId) {
        await this.finalizeCall(activeRinging, 'missed');
      } else {
        throw new ConflictException('A call is already ringing in this chat');
      }
    }

    const caller = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, name: true, avatarUrl: true },
    });

    if (!caller) {
      throw new NotFoundException('User not found');
    }

    const room = await this.dailyService.createRoom(mode);

    const call = await this.callSessionsRepository.save(
      this.callSessionsRepository.create({
        conversationId: chatId,
        initiatorId: userId,
        mode,
        status: 'ringing',
        dailyRoomName: room.name,
        dailyRoomUrl: room.url,
      }),
    );

    const token = await this.dailyService.createMeetingToken(
      room.name,
      caller.name,
      true,
    );

    const calleeToken = await this.dailyService.createMeetingToken(
      room.name,
      peer.user.name,
      false,
    );

    return {
      call: this.mapCallLog(call, userId),
      roomUrl: room.url,
      token,
      calleeToken,
      peerUserId: peer.userId,
    };
  }

  private async issueCalleeJoinToken(call: CallSession, user: User) {
    const token = await this.dailyService.createMeetingToken(
      call.dailyRoomName,
      user.name,
      false,
    );

    return {
      call: this.mapCallLog(call, user.id),
      roomUrl: call.dailyRoomUrl,
      token,
    };
  }

  async acceptCall(chatId: string, callId: string, userId: string) {
    await this.getParticipants(chatId, userId);

    const call = await this.callSessionsRepository.findOne({
      where: { id: callId, conversationId: chatId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.initiatorId === userId) {
      throw new ForbiddenException('Caller cannot accept their own call');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (call.status === 'ongoing') {
      return this.issueCalleeJoinToken(call, user);
    }

    if (call.status !== 'ringing') {
      throw new ConflictException('Call is no longer ringing');
    }

    const updateResult = await this.callSessionsRepository.update(
      { id: callId, conversationId: chatId, status: 'ringing' },
      { status: 'ongoing', answeredAt: new Date() },
    );

    if (!updateResult.affected) {
      const latest = await this.callSessionsRepository.findOne({
        where: { id: callId, conversationId: chatId },
      });

      if (latest?.status === 'ongoing') {
        return this.issueCalleeJoinToken(latest, user);
      }

      throw new ConflictException('Call is no longer ringing');
    }

    const acceptedCall = await this.callSessionsRepository.findOne({
      where: { id: callId, conversationId: chatId },
    });

    if (!acceptedCall) {
      throw new NotFoundException('Call not found');
    }

    return this.issueCalleeJoinToken(acceptedCall, user);
  }

  async declineCall(chatId: string, callId: string, userId: string) {
    await this.getParticipants(chatId, userId);

    const call = await this.callSessionsRepository.findOne({
      where: { id: callId, conversationId: chatId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.status !== 'ringing') {
      throw new ConflictException('Call is no longer ringing');
    }

    if (call.initiatorId === userId) {
      throw new ForbiddenException('Caller cannot decline their own call');
    }

    return this.finalizeCall(call, 'declined', userId);
  }

  async endCall(chatId: string, callId: string, userId: string) {
    await this.getParticipants(chatId, userId);

    const call = await this.callSessionsRepository.findOne({
      where: { id: callId, conversationId: chatId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (!ACTIVE_STATUSES.includes(call.status)) {
      throw new ConflictException('Call has already ended');
    }

    const status: CallStatus =
      call.status === 'ringing' && call.initiatorId === userId
        ? 'missed'
        : call.status === 'ringing'
          ? 'missed'
          : 'ended';

    return this.finalizeCall(call, status, userId);
  }

  async markCallMissed(chatId: string, callId: string, userId: string) {
    await this.getParticipants(chatId, userId);

    const call = await this.callSessionsRepository.findOne({
      where: { id: callId, conversationId: chatId, status: 'ringing' },
    });

    if (!call) {
      return null;
    }

    if (call.initiatorId !== userId) {
      throw new ForbiddenException('Only the caller can mark a call as missed');
    }

    return this.finalizeCall(call, 'missed');
  }
}
