import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AnalyticsService } from './analytics.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnalyticsScheduler {
  private readonly logger = new Logger(AnalyticsScheduler.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly usersService: UsersService,
  ) {}

  @Cron('0 */6 * * *')
  async autoSyncAllUsers() {
    this.logger.log('Running scheduled analytics sync...');
    try {
      const users = await this.usersService.findAll();
      for (const user of users) {
        try {
          const id = (user as any)._id?.toString?.() ?? String((user as any).id);
          if (user.metaAccessToken) {
            await this.analyticsService.syncMetaInsights(id);
          }
          if ((user as any).googleAccessToken) {
            await this.analyticsService.syncGoogleInsights(id);
          }
        } catch (err: any) {
          this.logger.warn(`Sync failed for user ${(user as any)._id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`Scheduler error: ${err.message}`);
    }
  }
}
