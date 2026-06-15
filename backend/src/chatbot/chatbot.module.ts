import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { Chatbot, ChatbotSchema } from './schemas/chatbot.schema';
import { AiModule } from '../ai/ai.module';
import { Brand, BrandSchema } from '../brand/brand.schema';
import { CampaigndSchema } from '../campaigns/schemas/campaind.schema';
import { Review, ReviewSchema } from '../reputation/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chatbot.name, schema: ChatbotSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: 'Campaign', schema: CampaigndSchema },
      { name: 'Review', schema: ReviewSchema },
    ]),
    AiModule,
  ],
  providers: [ChatbotService],
  controllers: [ChatbotController],
  exports: [ChatbotService],
})
export class ChatbotModule {}
