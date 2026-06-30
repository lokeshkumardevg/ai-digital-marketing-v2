import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { SemrushService } from './semrush.service';
import { AiController } from './ai.controller';
import { WebhookController } from './webhook.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AiAnalysis, AiAnalysisSchema } from './schemas/ai-analysis.schema';
import { Brand, BrandSchema } from '../brand/brand.schema';
import { BrandProfile, BrandProfileSchema } from './schemas/brand-profile.schema';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: AiAnalysis.name, schema: AiAnalysisSchema },
      { name: BrandProfile.name, schema: BrandProfileSchema },
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  providers: [AiService, SemrushService],
  controllers: [AiController, WebhookController],
  exports: [AiService, SemrushService],
})
export class AiModule {}