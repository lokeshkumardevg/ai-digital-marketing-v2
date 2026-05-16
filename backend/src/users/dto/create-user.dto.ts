import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, ArrayUnique } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  permissions?: string[];
}
