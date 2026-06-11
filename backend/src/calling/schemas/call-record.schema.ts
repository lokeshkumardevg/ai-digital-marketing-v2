import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CallRecordDocument = CallRecord & Document;

@Schema({ timestamps: true })
export class CallRecord {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CallCampaign', required: true })
  campaignId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop()
  callId: string; // ID returned by Voice AI API

  @Prop({ default: 'Pending' })
  status: string; // 'Pending', 'Ringing', 'In Progress', 'Completed', 'Failed', 'Voicemail'

  @Prop({ default: 0 })
  duration: number; // in seconds

  @Prop()
  recordingUrl: string;

  @Prop()
  transcript: string; // Full transcript of the call

  @Prop()
  summary: string; // AI generated summary
}

export const CallRecordSchema = SchemaFactory.createForClass(CallRecord);
