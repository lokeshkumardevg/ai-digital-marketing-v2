import {
  ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** YouTube-only settings. Other platforms ignore them. */
export class YoutubeOptionsDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsIn(['public', 'unlisted', 'private'])
  privacy?: 'public' | 'unlisted' | 'private';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  tags?: string[];

  /** YouTube requires every upload to be declared "made for kids" or not */
  @IsOptional()
  @IsBoolean()
  madeForKids?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class PublishSocialDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  platforms: string[];

  /** Public http(s) URLs, or files uploaded through POST /social/media (they look like /uploads/xyz.mp4) */
  @IsOptional()
  @IsArray()
  @Matches(/^(https?:\/\/\S+|\/uploads\/[\w.\-]+)$/, { each: true, message: 'Each media item must be an http(s) URL or an uploaded file path' })
  media?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => YoutubeOptionsDto)
  youtube?: YoutubeOptionsDto;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
