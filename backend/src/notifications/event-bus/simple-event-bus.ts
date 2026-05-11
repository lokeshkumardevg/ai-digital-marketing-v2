import { Injectable } from '@nestjs/common';
import { NotificationEventPayload } from './notification.event-bus';


@Injectable()
export class SimpleEventBus {
  private handlers: Array<(payload: NotificationEventPayload) => void | Promise<void>> = [];

  on(handler: (payload: NotificationEventPayload) => void | Promise<void>) {
    this.handlers.push(handler);
    return;
  }


  async emit(payload: NotificationEventPayload) {
    for (const h of this.handlers) {
      await h(payload);
    }
  }
}

