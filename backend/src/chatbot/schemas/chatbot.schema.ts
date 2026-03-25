import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatbotDocument = Chatbot & Document;

@Schema({ timestamps: true })
export class Chatbot {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  systemPrompt: string; // The LLM persona

  @Prop()
  welcomeMessage: string;

  @Prop({ default: '#8b5cf6' })
  themeColor: string;

  @Prop({ default: 'website' })
  integrationType: string; // 'website', 'whatsapp'

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  totalConversations: number;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
