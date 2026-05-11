import { Injectable, Logger } from '@nestjs/common';
import type { NotificationEventPayload } from '../event-bus/notification.event-bus';
import { NotificationEventBus } from '../event-bus/notification.event-bus';

import { NotificationDispatcher } from '../dispatcher/notification.dispatcher';

@Injectable()
export class NotificationEngine {
  private readonly logger = new Logger(NotificationEngine.name);

  constructor(
    private readonly eventBus: NotificationEventBus,
    private readonly dispatcher: NotificationDispatcher,
  ) {
    this.eventBus.on(async (payload) => {
      try {
        await this.dispatcher.dispatch(payload);
      } catch (err) {
        this.logger.error(`Notification engine failed for event=${payload.event}`, err instanceof Error ? err.stack : String(err));
      }
    });
  }
}

