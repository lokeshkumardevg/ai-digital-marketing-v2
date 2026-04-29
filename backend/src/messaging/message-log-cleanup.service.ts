import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessageLogService } from './message-log.service';

@Injectable()
export class MessageLogCleanupService {
  private readonly logger = new Logger(MessageLogCleanupService.name);

  constructor(private readonly messageLogService: MessageLogService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Running scheduled message log cleanup...');
    try {
      const deletedCount = await this.messageLogService.deleteOldLogs();
      this.logger.log(`Cleanup completed. Removed ${deletedCount} old logs.`);
    } catch (error: any) {
      this.logger.error('Log cleanup failed', error?.message || String(error));
    }
  }
}

