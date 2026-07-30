import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Roles schema definition with compound indexing
@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ required: true })
  workspaceId: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
