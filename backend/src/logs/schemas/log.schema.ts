import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemLogDocument = SystemLog & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class SystemLog {
  @Prop({ required: true, enum: ['log', 'warn', 'error', 'debug', 'verbose', 'fatal'] })
  level: string;

  @Prop()
  context?: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  meta?: Record<string, any>;

  @Prop()
  timestamp?: Date;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);

SystemLogSchema.index({ timestamp: -1 });
SystemLogSchema.index({ level: 1 });
SystemLogSchema.index({ context: 1 });
