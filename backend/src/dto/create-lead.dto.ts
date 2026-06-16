import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewStatus {
  PENDING = 'pending',
  SENT = 'sent',
  COMPLETED = 'completed',
}

export enum LeadSource {
  MANUAL = 'manual',
  CSV = 'csv',
  WEBSITE = 'website',
  SHOPIFY = 'shopify',
  REFERRAL = 'referral',
}

export enum LeadStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  brandId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(ReviewStatus)
  @IsOptional()
  reviewStatus?: ReviewStatus;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;
}

export class CreateLeadsBulkDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLeadDto)
  leads: CreateLeadDto[];
}