import { Module } from '@nestjs/common';
import { NotificationEventBus } from './notification.event-bus';
import { SimpleEventBus } from './simple-event-bus';

@Module({
  providers: [SimpleEventBus, NotificationEventBus],
  exports: [NotificationEventBus],
})
export class NotificationEventBusModule {}



