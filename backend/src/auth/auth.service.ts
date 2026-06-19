import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { PasswordReset } from './entities/password-reset.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      dto.email.toLowerCase(),
    );

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
    });

    return {
      user: this.toAuthenticatedUser(user),
      accessToken: await this.signToken(user.id, user.email),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: this.toAuthenticatedUser(user),
      accessToken: await this.signToken(user.id, user.email),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const message =
      'If an account exists for that email, password reset instructions have been sent.';

    if (!user) {
      return { message };
    }

    await this.passwordResetRepository.update(
      { userId: user.id, used: false },
      { used: true },
    );

    const token = randomBytes(32).toString('hex');
    const expiresInMinutes = Number(
      this.configService.get('PASSWORD_RESET_EXPIRES_MINUTES', 60),
    );
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.passwordResetRepository.save({
      token,
      userId: user.id,
      user,
      expiresAt,
      used: false,
    });

    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const isDev = this.configService.get('NODE_ENV', 'development') !== 'production';

    return {
      message,
      ...(isDev ? { resetUrl } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetRecord = await this.passwordResetRepository.findOne({
      where: { token: dto.token, used: false },
      relations: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersService.updatePasswordHash(resetRecord.userId, passwordHash);

    resetRecord.used = true;
    await this.passwordResetRepository.save(resetRecord);

    return { message: 'Password updated successfully. You can now log in.' };
  }

  toAuthenticatedUser(user: User): AuthenticatedUser {
    return this.usersService.toPublicUser(user);
  }

  async updateProfile(userId: string, name: string) {
    const user = await this.usersService.updateProfile(userId, name);
    return { user: this.toAuthenticatedUser(user) };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.usersService.updateAvatarUrl(userId, avatarUrl);
    return { user: this.toAuthenticatedUser(user) };
  }

  private signToken(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    });
  }
}
