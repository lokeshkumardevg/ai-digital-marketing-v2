import { Module } from '@nestjs/common';
import { CampaignService } from './campaigns.service';
import { CampaignController } from './campaigns.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './schemas/session.schema'; // 👈 FIX PATH

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Session', schema: SessionSchema }
    ])
  ],
  providers: [CampaignService],
  controllers: [CampaignController],
})
export class CampaignModule {}