import { IsString, IsArray, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class GenerateReferenceCreativeDto {
  @IsString()
  @MaxLength(1000)
  prompt!: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  referenceImages!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  productUrl?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'auto'])
  quality?: 'low' | 'medium' | 'high' | 'auto';
}