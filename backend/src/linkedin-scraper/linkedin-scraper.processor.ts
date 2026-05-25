import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { LinkedinScraperService } from './linkedin-scraper.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LinkedInAccountDocument } from '../linkedin-crm/schemas/linkedin-account.schema';

@Processor('linkedin-scraper')
export class LinkedinScraperProcessor {
  private readonly logger = new Logger(LinkedinScraperProcessor.name);

  constructor(
    private readonly scraperService: LinkedinScraperService,
    @InjectModel('LinkedInAccount') private readonly accountModel: Model<LinkedInAccountDocument>,
  ) {}

  @Process('scrape-profile')
  async handleScrapeProfile(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    const { accountId, linkedinUrl, liAtCookie } = job.data;
    
    try {
      await this.accountModel.findByIdAndUpdate(accountId, { scraperStatus: 'active' });
      
      // Run Playwright Scraper
      const profileData = await this.scraperService.scrapeProfile(linkedinUrl, liAtCookie);
      
      // Save extracted data back to the DB
      await this.accountModel.findByIdAndUpdate(accountId, {
        education: profileData.education || {},
        experience: profileData.experience || {},
        bio: profileData.about || '',
        scraperStatus: 'completed',
        lastSyncedAt: new Date(),
      });
      
      this.logger.log(`Job ${job.id} completed successfully`);
      return profileData;
    } catch (error: any) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      await this.accountModel.findByIdAndUpdate(accountId, { scraperStatus: 'failed' });
      throw error;
    }
  }
}
