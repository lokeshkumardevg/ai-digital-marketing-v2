import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { SemrushService } from './semrush.service';
import { AiController } from './ai.controller';
import { WebhookController } from './webhook.controller';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysis, AiAnalysisSchema } from './schemas/ai-analysis.schema';

import { BrandProfile, BrandProfileSchema } from './schemas/brand-profile.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: AiAnalysis.name, schema: AiAnalysisSchema },
      { name: BrandProfile.name, schema: BrandProfileSchema },
    ]),
  ],
  providers: [AiService, SemrushService],
  controllers: [AiController, WebhookController],
  exports: [AiService, SemrushService],
})
export class AiModule {}
