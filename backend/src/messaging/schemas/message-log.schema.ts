import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecipientLogDocument = HydratedDocument<RecipientLog>;
export type MessageLogDocument = HydratedDocument<MessageLog>;

@Schema({ _id: false })
export class RecipientLog {
  @Prop({ required: true })
  name!: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ enum: ['pending', 'success', 'failed'], default: 'pending' })
  status!: string;

  @Prop()
  errorMessage?: string;
}

export const RecipientLogSchema = SchemaFactory.createForClass(RecipientLog);

@Schema({ timestamps: true })
export class MessageLog {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  messageContent!: string;

  @Prop({ required: true, enum: ['whatsapp', 'email', 'both'] })
  channel!: string;

  @Prop({ type: [RecipientLogSchema], default: [] })
  audienceList!: RecipientLog[];

  @Prop({ default: 0 })
  totalRecipients!: number;

  @Prop({ default: 0 })
  successCount!: number;

  @Prop({ default: 0 })
  failedCount!: number;

  @Prop({ default: 0 })
  processedCount!: number;

  @Prop({ enum: ['pending', 'success', 'partial', 'failed'], default: 'pending' })
  status!: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MessageLogSchema = SchemaFactory.createForClass(MessageLog);

