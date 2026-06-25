import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { Module } from '@nestjs/common';
import { CampaignService } from './campaigns.service';
import { CampaignCronService } from './campaigns.cron';
import { CampaignController } from './campaigns.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './schemas/session.schema'; // 👈 FIX PATH
import { CampaigndSchema } from './schemas/campaind.schema';

@Module({
  imports: [
    UsersModule,
    WalletModule,
    MongooseModule.forFeature([
  {
    name: 'Session',
    schema: SessionSchema,
  },
  {
    name: 'Campaign',
    schema: CampaigndSchema,
  },
]),
  ],
  providers: [CampaignService, CampaignCronService],
  controllers: [CampaignController],
})
export class CampaignModule {}