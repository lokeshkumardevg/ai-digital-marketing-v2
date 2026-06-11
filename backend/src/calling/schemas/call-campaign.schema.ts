import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CallCampaignDocument = CallCampaign & Document;

@Schema({ timestamps: true })
export class CallCampaign {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  totalContacts: number;

  @Prop({ default: 0 })
  completedCalls: number;

  @Prop({ default: 'Running' })
  status: string; // 'Running', 'Completed', 'Failed'
}

export const CallCampaignSchema = SchemaFactory.createForClass(CallCampaign);
