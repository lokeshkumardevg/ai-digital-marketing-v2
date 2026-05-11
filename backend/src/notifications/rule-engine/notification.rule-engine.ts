import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationRuleEntity } from './notification-rule.schema';
import type { NotificationEventPayload } from '../event-bus/notification.event-bus';

function renderTemplate(template: string, data: Record<string, any> = {}) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const v = data[key];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

@Injectable()
export class NotificationRuleEngine {
  constructor(
    @InjectModel(NotificationRuleEntity.name)
    private readonly ruleModel: Model<NotificationRuleEntity>,
  ) {}

  async evaluate(event: NotificationEventPayload) {
    // Basic MVP: match exact event string
    const rule = await this.ruleModel.findOne({
      event: event.event,
      enabled: true,
    });

    if (!rule) {
      return null;
    }

    const template = rule.template;
    const title = renderTemplate(template.titleTemplate, event.data || {});
    const message = renderTemplate(template.messageTemplate, event.data || {});
    const actionUrl = template.actionUrlTemplate
      ? renderTemplate(template.actionUrlTemplate, event.data || {})
      : undefined;
    const actionLabel = template.actionLabelTemplate
      ? renderTemplate(template.actionLabelTemplate, event.data || {})
      : undefined;

    return {
      recipients: event.recipients,
      channels: rule.channels,
      notification: {
        title,
        message,
        actionUrl: actionUrl ?? null,
        actionLabel: actionLabel ?? null,
        meta: event.data || {},
      },
    };
  }
}

