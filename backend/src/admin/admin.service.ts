import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { Conversation } from '../chats/entities/conversation.entity';
import { Group } from '../groups/entities/group.entity';
import { Habit } from '../habits/entities/habit.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtPayload } from './strategies/admin-jwt.strategy';
import type { AdminUser } from './types/admin-user.type';

@Injectable()
export class AdminService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(Habit)
    private readonly habitsRepository: Repository<Habit>,
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
  ) {}

  async login(dto: AdminLoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const admin: AdminUser = {
      id: user.id,
      email: user.email,
      role: 'admin',
    };

    const payload: AdminJwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: 'admin',
    };

    return {
      admin,
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
    };
  }

  async getStatsWithUserCount() {
    const [registeredUsers, groups, chats, totalHabits] = await Promise.all([
      this.usersRepository.count(),
      this.groupsRepository.count(),
      this.conversationsRepository.count(),
      this.habitsRepository.count(),
    ]);

    return {
      registeredUsers,
      groups,
      chats,
      totalHabits,
    };
  }

  async getRegisteredUsers() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => this.usersService.toPublicUser(user));
  }

  async getDemoUsers() {
    return this.getRegisteredUsers();
  }

  async getGroups() {
    const groups = await this.groupsRepository.find({
      relations: { members: true, tags: true },
      order: { name: 'ASC' },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.imageUrl ?? '',
      tags: group.tags.map((tag) => tag.tag),
      memberCount: group.members.length,
    }));
  }

  async getChats() {
    return this.conversationsRepository.find({
      relations: { participants: { user: true } },
      order: { updatedAt: 'DESC' },
    });
  }
}
