import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ required: true })
  workspaceId: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
