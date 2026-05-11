import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';

export type LegacyNotificationRecipient = string;

export interface LegacyCreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: any;
  category?: any;
  actionUrl?: string | null;
  actionLabel?: string | null;
  meta?: Record<string, any>;
}

@Injectable()
export class NotificationLegacyAdapter {
  constructor(private readonly notificationsService: NotificationsService) {}

  async createLegacy(payload: LegacyCreateNotificationInput) {
    return this.notificationsService.create(payload as any);
  }
}

