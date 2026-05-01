import { ArrayMinSize, IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class PublishSocialDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  platforms: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  media?: string[];

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
