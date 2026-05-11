import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { GatewayModule } from '../gateway.module';
import { NotificationsEventController } from './notifications.event.controller';
import { NotificationsArchitectureModule } from './notifications-architecture.module';
import { NotificationEventBusModule } from './event-bus/event-bus.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    GatewayModule,
    NotificationsArchitectureModule,
    NotificationEventBusModule,
  ],

  controllers: [NotificationsController, NotificationsEventController],

  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
