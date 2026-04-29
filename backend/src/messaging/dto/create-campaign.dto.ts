import { IsString, IsArray, IsIn, IsNotEmpty, ValidateNested, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateCampaignDto {
  @IsIn(['whatsapp', 'email', 'both'])
  type: 'whatsapp' | 'email' | 'both';

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  users: UserDto[];
}
