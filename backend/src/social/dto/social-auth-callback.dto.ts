import { IsOptional, IsString } from 'class-validator';

export class SocialAuthCallbackDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
