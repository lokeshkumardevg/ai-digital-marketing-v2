import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ default: 'v2' })
  version: string;

  @Prop({ type: Array, default: [] })
  messages: any[];

  @Prop({ default: 0 })
  msgCounter: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);