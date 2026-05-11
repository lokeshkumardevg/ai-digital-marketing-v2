import { Injectable } from '@nestjs/common';
import type { NotificationEventPayload } from '../event-bus/notification.event-bus';

@Injectable()
export class WebsocketChannelHandler {
  // MVP: In this refactor phase we just return intended payload.
  // Dispatcher will use legacy adapter to persist + websocket emit.
  async handle(event: NotificationEventPayload, resolved: any) {
    return {
      ...resolved,
      // channel name is already in resolved.channels
    };
  }
}

