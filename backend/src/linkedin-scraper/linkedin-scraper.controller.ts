import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LinkedInAccountDocument } from '../linkedin-crm/schemas/linkedin-account.schema';

@Controller('linkedin-scraper')
export class LinkedinScraperController {
  constructor(
    @InjectQueue('linkedin-scraper') private readonly scraperQueue: Queue,
    @InjectModel('LinkedInAccount') private readonly accountModel: Model<LinkedInAccountDocument>,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('trigger-profile-scrape')
  async triggerProfileScrape(@Request() req: any, @Body() body: { liAtCookie: string }) {
    if (!body.liAtCookie) {
      throw new BadRequestException('LinkedIn session cookie (li_at) is required');
    }

    // Find user's connected LinkedIn account
    const account = await this.accountModel.findOne({ userId: new Types.ObjectId(req.user.id) });
    if (!account) {
      throw new BadRequestException('No LinkedIn account connected');
    }

    // Save cookie to DB securely
    account.li_at = body.liAtCookie;
    account.scraperStatus = 'pending';
    await account.save();

    const linkedinUrl = account.publicProfileUrl || `https://www.linkedin.com/in/${account.linkedinId}`;

    // Add job to BullMQ
    const job = await this.scraperQueue.add('scrape-profile', {
      accountId: account._id.toString(),
      linkedinUrl,
      liAtCookie: body.liAtCookie,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    return { success: true, jobId: job.id, message: 'Scraping job queued' };
  }
}
