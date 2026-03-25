import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { Chatbot, ChatbotSchema } from './schemas/chatbot.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chatbot.name, schema: ChatbotSchema }]),
    AiModule,
  ],
  providers: [ChatbotService],
  controllers: [ChatbotController],
  exports: [ChatbotService],
})
export class ChatbotModule {}
