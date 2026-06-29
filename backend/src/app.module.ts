import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { AppGateway } from './app.gateway';
import { GatewayModule } from './gateway.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmModule } from './crm/crm.module';
import { CampaignModule } from './campaigns/campaigns.module';
import { ContentModule } from './content/content.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ProductsModule } from './products/products.module';
import { BillingModule } from './billing/billing.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SocialModule } from './social/social.module';
import { RolesModule } from './roles/roles.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { WalletModule } from './wallet/wallet.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BrandModule } from './brand/brand.module';
import { PlatformPostsModule } from './platformposts/platformposts.module';
import { LinkedInCrmModule } from './linkedin-crm/linkedin-crm.module';
import { LinkedinScraperModule } from './linkedin-scraper/linkedin-scraper.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReputationModule } from './reputation/reputation.module';
import { CallingModule } from './calling/calling.module';
import { GoogleBusinessModule } from './google-business/google-business.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MetaReviewsModule } from './meta-reviews/meta-reviews.module';
import { ReviewAgentModule } from './reviewagent/reviewagent.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    GatewayModule,
    AiModule,
    CrmModule,
    CampaignModule,
    WalletModule,
    ContentModule,
    ChatbotModule,
    AnalyticsModule,
    BillingModule,
    AuthModule,
    UsersModule,
    SocialModule,
    RolesModule,
    WorkflowsModule,
    ProductsModule,
    MessagingModule,
    NotificationsModule,
    BrandModule,
    PlatformPostsModule,
    LinkedInCrmModule,
    LinkedinScraperModule,
    ReviewsModule,
    ReputationModule,
    CallingModule,
    GoogleBusinessModule,
    MetaReviewsModule,
    ReviewAgentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

