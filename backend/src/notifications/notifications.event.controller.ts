import { Body, Controller, Post } from '@nestjs/common';
import { EmitNotificationEventDto } from './dto/emit-notification-event.dto';
import { NotificationEventBus } from './event-bus/notification.event-bus';

@Controller('notification-events')
export class NotificationsEventController {
  constructor(private readonly eventBus: NotificationEventBus) {}

  @Post('emit')
  async emit(@Body() dto: EmitNotificationEventDto) {
    this.eventBus.emit({
      event: dto.event,
      source: dto.source,
      recipients: dto.recipients,
      data: dto.data,
      channels: dto.channels,
    });

    return { status: 'success' };
  }
}

