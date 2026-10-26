import {
  IsString, IsOptional, IsArray, IsBoolean, IsIn, MaxLength, ArrayMinSize, Matches,
} from 'class-validator';

export class CreateAutoPostTopicDto {
  @IsString()
  @MaxLength(200)
  topic: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string;

  @IsOptional()
  @IsIn(['professional', 'casual', 'witty', 'educational', 'promotional', 'storytelling', 'inspirational'])
  tone?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  platforms: string[];

  @IsOptional()
  @IsIn(['daily', 'twice_daily', 'weekly', 'every_3_days'])
  frequency?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'preferredTime must be in HH:mm format' })
  preferredTime?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}

export class UpdateAutoPostTopicDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string;

  @IsOptional()
  @IsIn(['professional', 'casual', 'witty', 'educational', 'promotional', 'storytelling', 'inspirational'])
  tone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsIn(['daily', 'twice_daily', 'weekly', 'every_3_days'])
  frequency?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'preferredTime must be in HH:mm format' })
  preferredTime?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsString()
  language?: string;
}
