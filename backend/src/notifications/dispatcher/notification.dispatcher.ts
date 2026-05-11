import { Injectable } from '@nestjs/common';
import type { NotificationEventPayload } from '../event-bus/notification.event-bus';
import { NotificationRuleEngine } from '../rule-engine/notification.rule-engine';
import { NotificationLegacyAdapter } from '../legacy/notification-legacy.adapter';

@Injectable()
export class NotificationDispatcher {
  constructor(
    private readonly ruleEngine: NotificationRuleEngine,
    private readonly legacyAdapter: NotificationLegacyAdapter,
  ) {}

  // MVP dispatcher: evaluate rules -> persist via legacy adapter (still using old schema)
  async dispatch(event: NotificationEventPayload) {
    const resolved = await this.ruleEngine.evaluate(event);
    if (!resolved) return { ignored: true };

    const userId = resolved.recipients?.userId;

    // Backward compatible bridge:
    // - If rule specifies recipients.userId -> create notification for that user.
    // - Otherwise fallback to legacy "global" behavior by leaving userId empty.
    await this.legacyAdapter.createLegacy({
      userId: userId || '',
      title: resolved.notification.title,
      message: resolved.notification.message,
      // Keep legacy required defaults for now
      type: 'info',
      category: 'general',

      actionUrl: resolved.notification.actionUrl,
      actionLabel: resolved.notification.actionLabel,
      meta: resolved.notification.meta,
    });

    return { dispatched: true };
  }
}

