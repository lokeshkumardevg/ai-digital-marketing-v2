import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { SemrushService } from './semrush.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysis, AiAnalysisSchema } from './schemas/ai-analysis.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: AiAnalysis.name, schema: AiAnalysisSchema }]),
  ],
  providers: [AiService, SemrushService],
  controllers: [AiController],
  exports: [AiService, SemrushService],
})
export class AiModule {}
