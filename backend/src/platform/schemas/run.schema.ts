import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RunDocument = Run & Document;

@Schema({ timestamps: true, collection: 'agent_runs' })
export class Run {
  @Prop({ required: true, unique: true, index: true })
  runId: string; // UUID

  @Prop({ required: true, index: true })
  agentId: string;

  @Prop({ required: true, enum: ['max', 'stella', 'atlas', 'echo'] })
  coworker: 'max' | 'stella' | 'atlas' | 'echo';

  @Prop({ required: true, index: true })
  orgId: string;

  @Prop({ default: 'default' })
  locationId: string;

  @Prop({ default: null })
  eventId?: string;

  @Prop({
    required: true,
    enum: ['queued', 'running', 'awaiting_approval', 'approved', 'executed', 'rejected', 'failed', 'rolled_back', 'cancelled'],
    default: 'queued',
  })
  status: 'queued' | 'running' | 'awaiting_approval' | 'approved' | 'executed' | 'rejected' | 'failed' | 'rolled_back' | 'cancelled';

  @Prop({ default: '1.0.0' })
  promptVersion: string;

  @Prop({ default: 'gpt-4o-mini' })
  model: string;

  @Prop({ type: Object, default: {} })
  contextUsed: Record<string, any>;

  @Prop({ type: Object, default: {} })
  proposedAction: {
    actionType: string;
    summary: string;
    targetId?: string;
    payload: any;
  };

  @Prop({ type: Object, default: null })
  executedAction?: any;

  @Prop({ type: Object, default: null })
  result?: any;

  @Prop({ type: Object, default: null })
  approver?: {
    userId: string;
    userEmail: string;
    action: 'approved' | 'rejected';
    decidedAt: Date;
    notes?: string;
  };

  @Prop({ default: 1 })
  creditCost: number;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop({ default: null })
  completedAt?: Date;

  @Prop({ default: null })
  error?: string;
}

export const RunSchema = SchemaFactory.createForClass(Run);
RunSchema.index({ runId: 1 });
RunSchema.index({ orgId: 1, coworker: 1 });
RunSchema.index({ orgId: 1, status: 1 });

