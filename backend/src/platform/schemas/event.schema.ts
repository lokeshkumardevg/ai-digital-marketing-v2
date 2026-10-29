import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformEventDocument = PlatformEvent & Document;

@Schema({ timestamps: true, collection: 'platform_events' })
export class PlatformEvent {
  @Prop({ required: true, unique: true })
  eventId: string; // UUID

  @Prop({ required: true, unique: true, index: true })
  idempotencyKey: string; // e.g. "google_review:rev_123" or "crm_lead:user_456"

  @Prop({ required: true, index: true })
  eventType: string; // e.g. "review.created", "lead.created", "call.received"

  @Prop({ required: true, index: true })
  orgId: string; // Tenant / User ID

  @Prop({ default: 'default' })
  locationId: string;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;

  @Prop({ default: 'pending', enum: ['pending', 'processing', 'completed', 'failed'] })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop({ default: null })
  error?: string;
}

export const PlatformEventSchema = SchemaFactory.createForClass(PlatformEvent);
PlatformEventSchema.index({ idempotencyKey: 1 });
PlatformEventSchema.index({ orgId: 1, eventType: 1 });

