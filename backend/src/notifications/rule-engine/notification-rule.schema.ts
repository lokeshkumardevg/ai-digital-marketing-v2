import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationRuleActionTemplate = {
  titleTemplate: string; // e.g. "Wallet +{{amount}}"
  messageTemplate: string; // e.g. "Your wallet has been recharged"
  // Additional fields can be added later (url/label/meta)
  actionUrlTemplate?: string;
  actionLabelTemplate?: string;
};

export type NotificationRule = Document & {
  event: string;
  enabled: boolean;
  // Rule decides recipients (simple MVP)
  recipientStrategy: 'explicit' | 'tenant_default' | 'workspace_default';
  channels: Array<'websocket' | 'email' | 'push'>;
  template: NotificationRuleActionTemplate;
};

@Schema({ timestamps: true })
export class NotificationRuleEntity extends Document {
  @Prop({ required: true, index: true })
  event: string;

  @Prop({ default: true, index: true })
  enabled: boolean;

  @Prop({
    type: String,
    enum: ['explicit', 'tenant_default', 'workspace_default'],
    default: 'explicit',
  })
  recipientStrategy: 'explicit' | 'tenant_default' | 'workspace_default';

  @Prop({
    type: [String],
    enum: ['websocket', 'email', 'push'],
    default: ['websocket'],
  })
  channels: Array<'websocket' | 'email' | 'push'>;

  @Prop({ type: Object, required: true })
  template: NotificationRuleActionTemplate;
}

export const NotificationRuleSchema = SchemaFactory.createForClass(NotificationRuleEntity);
NotificationRuleSchema.index({ event: 1, enabled: 1 });

