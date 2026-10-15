// src/messaging/inbox/dto/inbox.dto.ts
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}

export class NewConversationDto {
  @IsIn(['whatsapp', 'email'])
  channel!: 'whatsapp' | 'email';

  /** Phone number (whatsapp) or email address (email) */
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  to!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}

export class SetStatusDto {
  @IsIn(['open', 'resolved'])
  status!: 'open' | 'resolved';
}
