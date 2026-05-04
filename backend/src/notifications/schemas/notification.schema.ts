import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationCategory =
  | 'campaign'
  | 'social'
  | 'ai'
  | 'billing'
  | 'system'
  | 'messaging'
  | 'analytics'
  | 'general';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'info' })
  type: NotificationType;

  @Prop({ default: 'general' })
  category: NotificationCategory;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  actionUrl?: string;

  @Prop()
  actionLabel?: string;

  @Prop({ type: Object, default: {} })
  meta: Record<string, any>;

  @Prop({ default: 'web' })
  channel: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
