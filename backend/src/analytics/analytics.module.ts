import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UsersModule } from '../users/users.module';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Analytics, AnalyticsSchema } from './schemas/analytics.schema';
import { Campaign, CampaignSchema } from '../campaigns/schemas/campaign.schema';
import { AiModule } from '../ai/ai.module';
import { AnalyticsScheduler } from './analytics.scheduler';
import { AnalyticsSeeder } from './analytics.seeder';

@Module({
  imports: [
    RedisModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: 'Campaign', schema: CampaignSchema },
    ]),
    AiModule,
  ],
  providers: [AnalyticsService, AnalyticsScheduler, AnalyticsSeeder],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

