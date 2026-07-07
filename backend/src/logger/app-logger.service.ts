import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  private logsService: LogsService;

  setLogsService(logsService: LogsService) {
    this.logsService = logsService;
  }

  log(message: any, context?: string) {
    super.log(message, context);
    if (this.logsService) {
      this.logsService.createLog('log', String(message), context);
    }
  }

  error(message: any, stackOrContext?: string, context?: string) {
    super.error(message, stackOrContext, context);
    if (this.logsService) {
      this.logsService.createLog('error', String(message), context || stackOrContext, { stack: stackOrContext });
    }
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    if (this.logsService) {
      this.logsService.createLog('warn', String(message), context);
    }
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    if (this.logsService) {
      this.logsService.createLog('debug', String(message), context);
    }
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    if (this.logsService) {
      this.logsService.createLog('verbose', String(message), context);
    }
  }
}
