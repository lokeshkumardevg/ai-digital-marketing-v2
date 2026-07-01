import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

@Schema({ timestamps: true })
export class Analytics {
  @Prop({ required: true })
  date: Date;

  @Prop({ default: 'meta' })
  platform: string; // 'meta' | 'google' | 'manual' | 'demo'

  @Prop({ default: 0 })
  spend: number;

  @Prop({ default: 0 })
  impressions: number;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: 0 })
  conversions: number;

  @Prop({ default: 0 })
  revenue: number;

  @Prop({ default: 0 })
  cpm: number;

  @Prop({ default: 0 })
  cpc: number;

  @Prop({ default: 0 })
  ctr: number;

  @Prop({ default: 'default_tenant' })
  workspaceId: string;

  /** Legacy fields (optional, for older documents) */
  @Prop()
  websiteTraffic?: number;

  @Prop()
  leadsGenerated?: number;

  @Prop()
  adSpend?: number;

  @Prop()
  aiTokensUsed?: number;

  @Prop()
  campaignsActive?: number;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

AnalyticsSchema.index({ date: 1, platform: 1, workspaceId: 1 }, { unique: true });
