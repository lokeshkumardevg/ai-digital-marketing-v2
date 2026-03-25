import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

@Schema({ timestamps: true })
export class Analytics {
  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 0 })
  websiteTraffic: number;

  @Prop({ default: 0 })
  leadsGenerated: number;

  @Prop({ default: 0 })
  adSpend: number;

  @Prop({ default: 0 })
  revenue: number;

  @Prop({ default: 0 })
  aiTokensUsed: number;

  @Prop({ default: 0 })
  campaignsActive: number;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
