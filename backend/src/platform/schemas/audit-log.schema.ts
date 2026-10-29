import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'agent_audit_logs' })
export class AuditLog {
  @Prop({ required: true, unique: true, index: true })
  logId: string; // UUID

  @Prop({ required: true, index: true })
  orgId: string;

  @Prop({ default: 'default' })
  locationId: string;

  @Prop({ default: null, index: true })
  runId?: string;

  @Prop({ default: null, index: true })
  agentId?: string;

  @Prop({ required: true })
  action: string; // e.g. 'agent.proposed', 'approval.granted', 'approval.rejected', 'action.executed'

  @Prop({ type: Object, required: true })
  actor: {
    type: 'agent' | 'user' | 'system';
    id: string;
    name?: string;
  };

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ orgId: 1, createdAt: -1 });
AuditLogSchema.index({ runId: 1 });

