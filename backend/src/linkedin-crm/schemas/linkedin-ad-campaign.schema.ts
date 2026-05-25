import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedInAdCampaignDocument = LinkedInAdCampaign & Document;

@Schema({ timestamps: true })
export class LinkedInAdCampaign {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LinkedInAccount', required: true })
  accountId: Types.ObjectId;

  @Prop({ required: true })
  campaignId: string; // LinkedIn's Ad Campaign ID

  @Prop({ required: true })
  name: string;

  @Prop()
  status: string; // ACTIVE, PAUSED, ARCHIVED, CANCELED, etc.

  @Prop()
  objectiveType: string;

  @Prop({ type: Object, default: {} })
  budget: Record<string, any>; // daily, total budget etc.

  @Prop({ type: Object, default: {} })
  metrics: Record<string, any>; // impressions, clicks, spend, conversions, etc.

  @Prop()
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: Object, default: {} })
  rawCampaignData: Record<string, any>; // Full raw LinkedIn API response
}

export const LinkedInAdCampaignSchema = SchemaFactory.createForClass(LinkedInAdCampaign);
