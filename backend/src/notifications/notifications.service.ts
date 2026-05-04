import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationCategory,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { AppGateway } from '../app.gateway';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  actionUrl?: string;
  actionLabel?: string;
  meta?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notifModel: Model<NotificationDocument>,
    private readonly gateway: AppGateway,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = await new this.notifModel({
      userId: dto.userId || '',
      title: dto.title,
      message: dto.message,
      type: dto.type || 'info',
      category: dto.category || 'general',
      actionUrl: dto.actionUrl || null,
      actionLabel: dto.actionLabel || null,
      meta: dto.meta || {},
    }).save();

    const payload = {
      id: notif._id.toString(),
      title: notif.title,
      message: notif.message,
      type: notif.type,
      category: notif.category,
      actionUrl: notif.actionUrl,
      actionLabel: notif.actionLabel,
      time: (notif as any).createdAt?.toISOString() || new Date().toISOString(),
      read: false,
    };

    if (!dto.userId) {
      this.gateway.sendGlobalEvent(payload);
    } else {
      this.gateway.sendToUser(dto.userId, payload);
    }

    this.logger.log(`Notification created: [${notif.type}] ${notif.title} -> ${notif.userId || 'ALL'}`);
    return notif;
  }

  async notifyCampaign(
    userId: string,
    campaignName: string,
    status: 'published' | 'paused' | 'budget_alert',
    extra?: any,
  ) {
    const map = {
      published: {
        title: 'Campaign Live',
        message: `"${campaignName}" is now running across all platforms.`,
        type: 'success' as NotificationType,
      },
      paused: {
        title: 'Campaign Paused',
        message: `"${campaignName}" has been paused by AI budget guard.`,
        type: 'warning' as NotificationType,
      },
      budget_alert: {
        title: 'Budget Alert',
        message: `"${campaignName}" has consumed 80% of daily budget.`,
        type: 'warning' as NotificationType,
      },
    };
    const { title, message, type } = map[status];
    return this.create({
      userId,
      title,
      message,
      type,
      category: 'campaign',
      actionUrl: '/campaigns',
      actionLabel: 'View Campaigns',
      meta: extra,
    });
  }

  async notifySocial(userId: string, platform: string, status: 'published' | 'failed', extra?: any) {
    return this.create({
      userId,
      title: status === 'published' ? `${platform} Post Published` : `${platform} Post Failed`,
      message:
        status === 'published'
          ? `Your post was successfully published to ${platform}.`
          : `Failed to publish to ${platform}. Check your connection.`,
      type: status === 'published' ? 'success' : 'error',
      category: 'social',
      actionUrl: '/social',
      actionLabel: 'Social Hub',
      meta: extra,
    });
  }

  async notifyAI(userId: string, agentName: string, status: 'online' | 'offline' | 'task_complete', extra?: any) {
    return this.create({
      userId,
      title:
        status === 'online'
          ? `${agentName} Deployed`
          : status === 'offline'
            ? `${agentName} Offline`
            : `${agentName} Task Done`,
      message:
        status === 'task_complete'
          ? `AI agent "${agentName}" has completed its assigned task.`
          : `Agent "${agentName}" is now ${status}.`,
      type: status === 'task_complete' ? 'success' : status === 'online' ? 'info' : 'warning',
      category: 'ai',
      actionUrl: '/ai-agents',
      actionLabel: 'View Agents',
      meta: extra,
    });
  }

  async notifyBilling(
    userId: string,
    event: 'recharged' | 'low_balance' | 'deducted',
    amount?: number,
    extra?: any,
  ) {
    const map = {
      recharged: {
        title: 'Wallet Recharged',
        message: `Rs.${amount} successfully added to your wallet.`,
        type: 'success' as NotificationType,
      },
      low_balance: {
        title: 'Low Wallet Balance',
        message: 'Your wallet balance is below Rs.100. Recharge to keep campaigns running.',
        type: 'warning' as NotificationType,
      },
      deducted: {
        title: 'Wallet Deducted',
        message: `Rs.${amount} was deducted from your wallet.`,
        type: 'info' as NotificationType,
      },
    };
    const { title, message, type } = map[event];
    return this.create({
      userId,
      title,
      message,
      type,
      category: 'billing',
      actionUrl: '/billing',
      actionLabel: 'View Billing',
      meta: extra,
    });
  }

  async notifyMessaging(userId: string, queued: number, skipped: number, channel: string) {
    return this.create({
      userId,
      title: 'Bulk Message Queued',
      message: `${queued} ${channel} messages queued. ${skipped > 0 ? `${skipped} skipped.` : ''}`,
      type: 'success',
      category: 'messaging',
      actionUrl: '/messaging',
      actionLabel: 'Messaging Hub',
    });
  }

  async notifySystem(userId: string, title: string, message: string, type: NotificationType = 'info') {
    return this.create({ userId, title, message, type, category: 'system' });
  }

  async findForUser(
    userId: string,
    options?: { category?: string; unreadOnly?: boolean; limit?: number; skip?: number },
  ): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const filter: any = { $or: [{ userId }, { userId: '' }] };
    if (options?.category && options.category !== 'all') {
      filter.category = options.category;
    }
    if (options?.unreadOnly) {
      filter.read = false;
    }

    const limit = options?.limit || 50;
    const skip = options?.skip || 0;

    const [notifications, total, unread] = await Promise.all([
      this.notifModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.notifModel.countDocuments(filter),
      this.notifModel.countDocuments({ ...filter, read: false }),
    ]);

    return { notifications: notifications as any, total, unread };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notifModel.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userId: '' }] },
      { $set: { read: true } },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifModel.updateMany(
      { $or: [{ userId }, { userId: '' }], read: false },
      { $set: { read: true } },
    );
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    await this.notifModel.findOneAndDelete({ _id: id, $or: [{ userId }, { userId: '' }] });
  }

  async deleteAllRead(userId: string): Promise<void> {
    await this.notifModel.deleteMany({ $or: [{ userId }, { userId: '' }], read: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifModel.countDocuments({
      $or: [{ userId }, { userId: '' }],
      read: false,
    });
  }

  async pruneOld(retentionDays = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const result = await this.notifModel.deleteMany({ createdAt: { $lt: cutoff } });
    return result.deletedCount;
  }
}
