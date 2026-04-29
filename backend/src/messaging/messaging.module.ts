import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { memoryStorage } from 'multer';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { WhatsAppService } from './providers/whatsapp.service';
import { EmailService } from './providers/email.service';
import { MessagingProcessor } from './queue/messaging.processor';
import { MessageLog, MessageLogSchema } from './schemas/message-log.schema';
import { MessageLogService } from './message-log.service';
import { MessageLogController } from './message-log.controller';
import { MessageLogCleanupService } from './message-log-cleanup.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'messages' }),
    MulterModule.register({ storage: memoryStorage() }),
    MongooseModule.forFeature([{ name: MessageLog.name, schema: MessageLogSchema }]),
  ],
  controllers: [MessagingController, MessageLogController],
  providers: [MessagingService, WhatsAppService, EmailService, MessagingProcessor, MessageLogService, MessageLogCleanupService],
  exports: [MessagingService],
})
export class MessagingModule {}
