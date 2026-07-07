import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { SystemLog, SystemLogSchema } from './schemas/log.schema';
import { AppLogger } from '../logger/app-logger.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SystemLog.name, schema: SystemLogSchema }]),
  ],
  controllers: [LogsController],
  providers: [LogsService, AppLogger],
  exports: [LogsService, AppLogger],
})
export class LogsModule {}
