import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { InviteController } from './invite.controller';

@Module({
  imports: [DataModule],
  controllers: [InviteController],
})
export class InviteModule {}
