import { Module } from '@nestjs/common';
import { CampaignService } from './campaigns.service';
import { CampaignController } from './campaigns.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './schemas/session.schema'; // 👈 FIX PATH
import { CampaigndSchema } from './schemas/campaind.schema';

@Module({
  imports: [
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
  providers: [CampaignService],
  controllers: [CampaignController],
})
export class CampaignModule {}