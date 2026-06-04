import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkedInCrmService } from './linkedin-crm.service';
import { LinkedInCrmController } from './linkedin-crm.controller';
import { LinkedInAccount, LinkedInAccountSchema } from './schemas/linkedin-account.schema';
import { LinkedInLead, LinkedInLeadSchema } from './schemas/linkedin-lead.schema';
import { LinkedInPost, LinkedInPostSchema } from './schemas/linkedin-post.schema';
import { LinkedInAdCampaign, LinkedInAdCampaignSchema } from './schemas/linkedin-ad-campaign.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LinkedInAccount.name, schema: LinkedInAccountSchema },
      { name: LinkedInLead.name, schema: LinkedInLeadSchema },
      { name: LinkedInPost.name, schema: LinkedInPostSchema },
      { name: LinkedInAdCampaign.name, schema: LinkedInAdCampaignSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LinkedInCrmController],
  providers: [LinkedInCrmService],
  exports: [LinkedInCrmService],
})
export class LinkedInCrmModule {}
