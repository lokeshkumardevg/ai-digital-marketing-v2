import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkedinScraperService } from './linkedin-scraper.service';
import { LinkedinScraperProcessor } from './linkedin-scraper.processor';
import { LinkedinScraperController } from './linkedin-scraper.controller';
import { LinkedInAccountSchema } from '../linkedin-crm/schemas/linkedin-account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'LinkedInAccount', schema: LinkedInAccountSchema },
    ]),
    BullModule.registerQueue({
      name: 'linkedin-scraper',
    }),
  ],
  providers: [LinkedinScraperService, LinkedinScraperProcessor],
  controllers: [LinkedinScraperController],
})
export class LinkedinScraperModule {}
