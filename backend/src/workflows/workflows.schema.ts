import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Workflow extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Draft' })
  status: 'Active' | 'Draft' | 'Paused';

  @Prop({ type: Object, default: {} })
  config: {
    nodes: any[];
    edges: any[];
  };

  @Prop({ required: true })
  websiteId: string;

  @Prop({ default: 0 })
  executionsCount: number;

  @Prop({ default: 0 })
  successRate: number;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
