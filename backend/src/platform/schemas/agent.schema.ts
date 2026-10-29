import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true, collection: 'agents' })
export class Agent {
  @Prop({ required: true, unique: true })
  agentId: string; // e.g. 'review_response', 'ads_campaign', 'front_desk'

  @Prop({ required: true, enum: ['max', 'stella', 'atlas', 'echo'] })
  coworker: 'max' | 'stella' | 'atlas' | 'echo';

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  domain: string; // 'Growth' | 'Presence' | 'Operations' | 'Experience'

  @Prop({ required: true })
  description: string;

  @Prop({ default: '1.0.0' })
  version: string;

  @Prop({ type: Object, default: {} })
  trigger: { event: string; description?: string };

  @Prop({ type: [String], default: [] })
  inputs: string[];

  @Prop({ type: [String], default: [] })
  tools: string[];

  @Prop({ type: Object, default: { default_mode: 'approval', escalate_if: [], block_if: [] } })
  policy: {
    default_mode: 'approval' | 'auto';
    escalate_if: string[];
    block_if: string[];
  };

  @Prop({ type: Object, default: { action: '', log: true } })
  output: { action: string; log: boolean };

  @Prop({ type: Object, default: { dataset: '', min_score: 0.8 } })
  evaluation: { dataset: string; min_score: number };

  @Prop({ default: 'pending', enum: ['built', 'partial', 'pending'] })
  buildStatus: 'built' | 'partial' | 'pending';

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 'Bot' })
  icon: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
AgentSchema.index({ agentId: 1 });
AgentSchema.index({ coworker: 1 });

