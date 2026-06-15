import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsDate, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';

export class CreateLeadDto {
  @IsString() @IsNotEmpty() userId: string;
  @IsString() @IsNotEmpty() brandId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEmail()  @IsNotEmpty() email: string;

  @IsString() @IsOptional() phone?: string;

  @IsEnum(['pending', 'sent', 'completed'])
  @IsOptional() reviewStatus?: string;

  @IsEnum(['manual', 'csv', 'website', 'shopify', 'referral'])
  @IsOptional() source?: string;

  @IsEnum(['pending', 'active', 'inactive'])
  @IsOptional() status?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastPurchase?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpent?: number;
}

export class CreateLeadsBulkDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLeadDto)
  leads: CreateLeadDto[];
}