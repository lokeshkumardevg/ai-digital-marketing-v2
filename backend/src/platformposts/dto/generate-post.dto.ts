import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BrandDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  tagline?: string;

  @IsOptional() @IsString()
  industry?: string;

  @IsOptional() @IsString()
  businessModel?: string;

  @IsOptional() @IsString()
  toneOfVoice?: string;
}

export class AssetsDto {
  @IsOptional() @IsString()
  logoUrl?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  brandColors?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  websiteImages?: string[];
}

export class KeywordsDto {
  @IsOptional() @IsArray() @IsString({ each: true })
  primary?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  secondary?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  longTail?: string[];
}

export class GeneratePostDto {
  @IsString()
  campaignId: string;

  @IsOptional() @IsString()
  coreObjective?: string;

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  brandName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BrandDto)
  brand?: BrandDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AssetsDto)
  assets?: AssetsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => KeywordsDto)
  keywords?: KeywordsDto;
}