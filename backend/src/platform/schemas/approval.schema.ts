import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApprovalDocument = Approval & Document;

@Schema({ timestamps: true, collection: 'agent_approvals' })
export class Approval {
  @Prop({ required: true, unique: true, index: true })
  approvalId: string; // UUID

  @Prop({ required: true, index: true })
  runId: string;

  @Prop({ required: true, index: true })
  agentId: string;

  @Prop({ required: true, enum: ['max', 'stella', 'atlas', 'echo'] })
  coworker: 'max' | 'stella' | 'atlas' | 'echo';

  @Prop({ required: true, index: true })
  orgId: string;

  @Prop({ default: 'default' })
  locationId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  actionType: string; // e.g. 'publish_review_reply', 'adjust_budget', 'publish_post'

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'approved' | 'rejected' | 'escalated';

  @Prop({ default: 'medium', enum: ['low', 'medium', 'high', 'urgent'] })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Prop({ type: Object, required: true })
  proposedData: Record<string, any>;

  @Prop({ type: Object, default: null })
  originalContext?: Record<string, any>;

  @Prop({ type: Object, default: null })
  editedData?: Record<string, any>;

  @Prop({ default: null })
  rejectionReason?: string;

  @Prop({ default: null })
  reviewedBy?: string;

  @Prop({ default: null })
  reviewedAt?: Date;
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);
ApprovalSchema.index({ approvalId: 1 });
ApprovalSchema.index({ orgId: 1, status: 1 });
ApprovalSchema.index({ orgId: 1, coworker: 1 });

