import { IsArray, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class EmitNotificationEventDto {
  @IsString()
  event: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsObject()
  recipients?: {
    userId?: string;
    tenantId?: string;
    workspaceId?: string;
  };

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsIn(['websocket', 'email', 'push'], { each: true })
  channels?: Array<'websocket' | 'email' | 'push'>;
}

