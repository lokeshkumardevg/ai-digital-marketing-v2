import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, default: 'default_tenant' })
  tenantId: string;

  @Prop({ required: true, enum: ['free', 'pro', 'enterprise'], default: 'free' })
  plan: string;

  @Prop({ default: 'active' })
  status: string; // active, past_due, canceled

  @Prop()
  stripeCustomerId: string;

  @Prop()
  stripeSubscriptionId: string;

  @Prop({ default: 0 })
  aiTokensUsedCurrentBillingCycle: number;

  @Prop({ default: 10000 })
  aiTokenLimit: number;

  @Prop()
  currentPeriodEnd: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
