import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../chats/entities/conversation.entity';
import { Group } from '../groups/entities/group.entity';
import { Habit } from '../habits/entities/habit.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Group, Habit, Conversation]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtStrategy, AdminJwtAuthGuard],
})
export class AdminModule {}
