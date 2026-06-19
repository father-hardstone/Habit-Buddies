import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import type { AdminUser } from './types/admin-user.type';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('me')
  me(@CurrentAdmin() admin: AdminUser) {
    return { admin };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.adminService.getStatsWithUserCount();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('users')
  getRegisteredUsers() {
    return this.adminService.getRegisteredUsers();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('demo-users')
  getDemoUsers() {
    return this.adminService.getDemoUsers();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('groups')
  getGroups() {
    return this.adminService.getGroups();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('chats')
  getChats() {
    return this.adminService.getChats();
  }
}
