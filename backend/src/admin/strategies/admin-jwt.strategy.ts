import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AdminUser } from '../types/admin-user.type';

export type AdminJwtPayload = {
  sub: string;
  email: string;
  role: 'admin';
};

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: AdminJwtPayload): AdminUser {
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: 'admin',
    };
  }
}
