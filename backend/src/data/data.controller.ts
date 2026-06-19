import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { StorageService } from '../storage/storage.service';
import { DataService } from './data.service';
import { AddMessageDto, CreateDirectChatDto, CreateGroupDto, UpdateGroupDto, UpdateHabitsDto } from './dto/data.dto';

@Controller('data')
@UseGuards(JwtAuthGuard)
export class DataController {
  constructor(
    private readonly dataService: DataService,
    private readonly storageService: StorageService,
  ) {}

  @Get('groups')
  getAllGroups(@CurrentUser() user: AuthenticatedUser) {
    return this.dataService.getAllGroups(user.id);
  }

  @Post('groups')
  createGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGroupDto,
  ) {
    return this.dataService.createGroup(user.id, dto);
  }

  @Get('groups/joined')
  getJoinedGroups(@CurrentUser() user: AuthenticatedUser) {
    return this.dataService.getJoinedGroups(user.id);
  }

  @Get('groups/invite/:token')
  getInvitePreview(
    @Param('token') token: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.getInvitePreview(token, user.id);
  }

  @Post('groups/invite/:token/join')
  joinGroupByInvite(
    @Param('token') token: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.joinGroupByInvite(token, user.id);
  }

  @Get('groups/:id/invite')
  getGroupInviteLink(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.getGroupInviteLink(id, user.id);
  }

  @Post('groups/:id/join')
  joinGroup(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.joinGroup(id, user.id);
  }

  @Patch('groups/:id')
  updateGroup(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.dataService.updateGroup(id, user.id, dto);
  }

  @Post('groups/:id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadGroupImage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const groupsFolder =
      process.env.SUPABASE_GROUP_IMAGES_FOLDER ?? 'group-images';
    const imageUrl = await this.storageService.uploadImage(
      groupsFolder,
      file,
      id,
    );
    return this.dataService.updateGroupImage(id, user.id, imageUrl);
  }

  @Get('groups/:id')
  getGroupById(@Param('id') id: string) {
    return this.dataService.getGroupById(id);
  }

  @Get('groups/:id/habits')
  getHabitsForGroup(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.getHabitsForGroup(id, user.id);
  }

  @Post('groups/:groupId/habits/:habitId/complete')
  completeHabit(
    @Param('groupId') groupId: string,
    @Param('habitId') habitId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.completeHabit(groupId, habitId, user.id);
  }

  @Get('groups/:id/analytics')
  getGroupAnalytics(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.getGroupAnalytics(id, user.id);
  }

  @Put('groups/:id/habits')
  updateGroupHabits(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateHabitsDto,
  ) {
    return this.dataService.updateGroupHabits(id, user.id, dto.habits as never);
  }

  @Get('chats')
  getChats(@CurrentUser() user: AuthenticatedUser) {
    return this.dataService.getChatsForUser(user.id);
  }

  @Post('chats/direct')
  createDirectChat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDirectChatDto,
  ) {
    return this.dataService.findOrCreateDirectChat(
      user.id,
      dto.userId,
      dto.groupId,
    );
  }

  @Get('chats/:id')
  getChatById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.getChatById(id, user.id);
  }

  @Get('chats/:id/messages')
  getChatMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const parsedLimit = Number.parseInt(limit ?? '30', 10);

    return this.dataService.getChatMessages(id, user.id, {
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 30,
      before,
    });
  }

  @Post('chats/:id/messages')
  addMessage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddMessageDto,
  ) {
    return this.dataService.addMessageToChat(
      id,
      user.id,
      dto.text,
      dto.replyToMessageId,
    );
  }

  @Delete('chats/:chatId/messages/:messageId')
  deleteMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.deleteMessageFromChat(chatId, messageId, user.id);
  }

  @Post('chats/:id/read')
  markChatRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataService.markChatRead(id, user.id);
  }
}
