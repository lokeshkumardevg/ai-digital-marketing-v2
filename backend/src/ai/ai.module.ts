import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysis, AiAnalysisSchema } from './schemas/ai-analysis.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: AiAnalysis.name, schema: AiAnalysisSchema }]),
  ],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
