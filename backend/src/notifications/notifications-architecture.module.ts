import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationRuleEntity, NotificationRuleSchema } from './rule-engine/notification-rule.schema';
import { NotificationEventBusModule } from './event-bus/event-bus.module';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';

import { NotificationRuleEngine } from './rule-engine/notification.rule-engine';

import { NotificationDispatcher } from './dispatcher/notification.dispatcher';
import { NotificationLegacyAdapter } from './legacy/notification-legacy.adapter';
import { NotificationEngine } from './engine/notification-engine';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationRuleEntity.name, schema: NotificationRuleSchema },
      // Make NotificationsService able to inject its Notification model.
      { name: Notification.name, schema: NotificationSchema },
    ]),
    NotificationEventBusModule,
  ],
  providers: [
    NotificationEngine,
    NotificationDispatcher,
    NotificationRuleEngine,
    // Provide NotificationsService for NotificationLegacyAdapter dependency resolution.
    NotificationsService,
    NotificationLegacyAdapter,
  ],
  exports: [],
})
export class NotificationsArchitectureModule {}

