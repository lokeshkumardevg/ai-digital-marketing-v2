import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Audience } from '../../crm/schemas/audience.schema';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Audience'})
  audience: Audience;

  @Prop({ required: true })
  platform: string; // 'google_ads', 'facebook_ads', 'omnichannel'

  @Prop({ default: 'draft' })
  status: string; // 'draft', 'active', 'paused', 'completed'

  @Prop({ type: Object })
  aiGeneratedContent: {
    headline: string;
    primaryText: string;
    description: string;
    imageUrl: string;
  };

  @Prop({ default: 0 })
  budgetDaily: number;

  @Prop({ default: 0 })
  totalSpend: number;

  @Prop({ default: 0 })
  conversions: number;

  @Prop({ default: 0 })
  cpc: number; // Cost per click projection/actual
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
