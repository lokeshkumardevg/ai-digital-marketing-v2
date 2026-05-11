import { Injectable } from '@nestjs/common';
import { SimpleEventBus } from './simple-event-bus';



export type NotificationEventPayload = {

  // A logical event name, e.g. "billing.recharged" or "social.post.published"
  event: string;
  // Optional correlation / source
  source?: string;
  // User/tenant resolution hint (adapter will handle mapping)
  recipients?: { userId?: string; tenantId?: string; workspaceId?: string };
  // Arbitrary event data for rule engine/templates
  data?: Record<string, any>;
  // Optional channel preference
  channels?: Array<'websocket' | 'email' | 'push'>;
};

@Injectable()
export class NotificationEventBus {
  constructor(private readonly bus: SimpleEventBus) {}


  emit(payload: NotificationEventPayload) {
    return this.bus.emit(payload);
  }

  on(handler: (payload: NotificationEventPayload) => void) {
    return this.bus.on(handler);
  }
}


