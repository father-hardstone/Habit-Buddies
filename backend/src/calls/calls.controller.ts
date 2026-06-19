import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';

@Controller('data/chats/:chatId/calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  getCallHistory(
    @Param('chatId') chatId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.callsService.getCallHistory(chatId, user.id);
  }

  @Post()
  createCall(
    @Param('chatId') chatId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCallDto,
  ) {
    return this.callsService.createCall(chatId, user.id, dto.mode);
  }

  @Post(':callId/accept')
  acceptCall(
    @Param('chatId') chatId: string,
    @Param('callId') callId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.callsService.acceptCall(chatId, callId, user.id);
  }

  @Post(':callId/decline')
  declineCall(
    @Param('chatId') chatId: string,
    @Param('callId') callId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.callsService.declineCall(chatId, callId, user.id);
  }

  @Post(':callId/end')
  endCall(
    @Param('chatId') chatId: string,
    @Param('callId') callId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.callsService.endCall(chatId, callId, user.id);
  }

  @Post(':callId/missed')
  markMissed(
    @Param('chatId') chatId: string,
    @Param('callId') callId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.callsService.markCallMissed(chatId, callId, user.id);
  }
}
