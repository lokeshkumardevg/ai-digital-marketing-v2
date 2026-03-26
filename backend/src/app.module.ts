import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
// Future Module Imports
// import { AuthModule } from './auth/auth.module';
// import { CampaignsModule } from './campaigns/campaigns.module';
// import { BillingModule } from './billing/billing.module';

import { AppGateway } from './app.gateway';
import { GatewayModule } from './gateway.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmModule } from './crm/crm.module';
import { CampaignsModule } from './campaigns/campaigns.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexgen_marketing'),
    GatewayModule,
    AiModule,
    CrmModule,
    CampaignsModule,
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
