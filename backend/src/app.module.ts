import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get('REDIS_URL') || 'redis://localhost:6379',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority') || 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority',
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
    ProductsModule
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

