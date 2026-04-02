import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  type: string; // 'CREDIT' | 'DEBIT'

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'COMPLETED' })
  status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
