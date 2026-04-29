import { Controller, Get, Query, Logger } from '@nestjs/common';
import { MessageLogService } from './message-log.service';
import { QueryLogsDto } from './dto/query-logs.dto';

@Controller('messaging/logs')
export class MessageLogController {
  private readonly logger = new Logger(MessageLogController.name);

  constructor(private readonly messageLogService: MessageLogService) {}

  @Get()
  async getLogs(@Query() query: QueryLogsDto) {
    this.logger.log(`Fetching logs with filter: ${query.filter || 'all'}`);
    const logs = await this.messageLogService.findLogs(query.filter);
    return {
      success: true,
      count: logs.length,
      data: logs,
    };
  }
}

