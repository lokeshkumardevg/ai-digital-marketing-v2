import { Module } from '@nestjs/common';
import { CampaignController } from './campaigns.controller';
import { CampaignService } from './campaigns.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService],
    imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
})
export class CampaignModule {}
