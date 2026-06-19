import { IsIn, IsString } from 'class-validator';
import type { CallMode } from '../entities/call-session.entity';

export class CreateCallDto {
  @IsString()
  @IsIn(['audio', 'video'])
  mode: CallMode;
}
