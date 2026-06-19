import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AdminUser } from '../types/admin-user.type';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AdminUser }>();
    return request.user;
  },
);
