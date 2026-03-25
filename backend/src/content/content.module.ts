import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Content, ContentSchema } from './schemas/content.schema';
import { AiModule } from '../ai/ai.module'; // Import AI Orchestrator

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    AiModule,
  ],
  providers: [ContentService],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
