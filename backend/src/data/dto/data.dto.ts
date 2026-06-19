import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text: string;

  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;
}

export class UpdateHabitsDto {
  @IsArray()
  habits: Record<string, unknown>[];
}

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  aiHint?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateDirectChatDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
