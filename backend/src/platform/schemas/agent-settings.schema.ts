import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentSettingsDocument = AgentSettings & Document;

@Schema({ timestamps: true, collection: 'agent_settings' })
export class AgentSettings {
  @Prop({ required: true })
  orgId: string; // User ID / Tenant ID

  @Prop({ default: 'default' })
  locationId: string;

  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true, enum: ['approval', 'auto', 'disabled'], default: 'approval' })
  mode: 'approval' | 'auto' | 'disabled';

  @Prop({ default: 0 })
  dailyBudgetCap: number;

  @Prop({ default: '' })
  escalateToEmail: string;

  @Prop({ default: false })
  dryRunOnly: boolean;
}

export const AgentSettingsSchema = SchemaFactory.createForClass(AgentSettings);
AgentSettingsSchema.index({ orgId: 1, agentId: 1 }, { unique: true });

